import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import { createAuditLog } from "../services/audit.service.js";

export async function getClassAttendance(
    request: AuthenticatedRequest,
    response: Response
) {
    const { classId } = request.params;
    const date = request.query.date as string || new Date().toISOString().split('T')[0];
    const { schoolId } = request.user!;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                s.id as student_id,
                u.full_name,
                a.status,
                a.date
            FROM classes c
            JOIN students s ON s.course_id = c.course_id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN attendance a ON a.student_id = s.id AND a.class_id = $1 AND a.date = $2
            WHERE c.id = $1 AND u.school_id = $3
            ORDER BY u.full_name ASC;
        `, [classId, date, schoolId]);

        response.status(200).json({
            date: date,
            records: result.rows
        });

    } catch (error) {
        console.error("Get Class Attendance Error:", error);
        response.status(500).json({ message: "Failed to fetch attendance" });
    } finally {
        client.release();
    }
}


export async function getCourseDailySummary(
    request: AuthenticatedRequest,
    response: Response
) {
    const { courseId } = request.params;
    const date = request.query.date as string || new Date().toISOString().split('T')[0];
    const { schoolId } = request.user!;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                s.id as student_id,
                CASE 
                    WHEN bool_or(a.status = 'present') THEN 'present'
                    WHEN bool_or(a.status = 'late') THEN 'late'
                    WHEN bool_or(a.status = 'absent') THEN 'absent'
                    ELSE 'no_data'
                END as daily_status
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN classes c ON c.course_id = s.course_id
            LEFT JOIN attendance a ON a.student_id = s.id AND a.class_id = c.id AND a.date = $1
            WHERE s.course_id = $2 AND u.school_id = $3
            GROUP BY s.id
        `, [date, courseId, schoolId]);

        response.status(200).json({
            date: date,
            records: result.rows
        });

    } catch (error) {
        console.error("Get Course Daily Summary Error:", error);
        response.status(500).json({ message: "Failed to fetch course attendance summary" });
    } finally {
        client.release();
    }
}

export async function bulkUpsertClassAttendance(
    request: AuthenticatedRequest,
    response: Response
) {
    const { classId } = request.params;
    const { date, records } = request.body;

    const creator = request.user!;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const classCheck = await client.query(`
            SELECT c.id
            FROM classes c
            JOIN courses co ON c.course_id = co.id
            WHERE c.id = $1 AND co.school_id = $2
        `, [classId, creator.schoolId]);

        if (classCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(403).json({ message: "Class not found or unauthorized" });
        }

        const upsertPromises = records.map((record: { studentId: string, status: string }) => {
            return client.query(`
                INSERT INTO attendance (student_id, class_id, date, status)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (student_id, class_id, date) 
                DO UPDATE SET
                    status = EXCLUDED.status,
                    updated_at = NOW();
            `, [record.studentId, classId, date, record.status]);
        });

        await Promise.all(upsertPromises);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role as string,
            action: 'TAKE_CLASS_ATTENDANCE',
            schoolId: creator.schoolId as string,
            metadata: { classId, date, studentsCount: records.length }
        });

        await client.query("COMMIT");

        return response.status(200).json({ message: "Attendance successfully recorded" });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Attendance Upsert Error:", dbError);
        return response.status(500).json({ message: "Server error while saving attendance" });
    } finally {
        client.release();
    }
}


export async function getAttendanceCenterSummary(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const startDate = request.query.startDate as string;
    const endDate = request.query.endDate as string;

    if (!startDate || !endDate) {
        return response.status(400).json({ message: "startDate and endDate are required" });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT
                c.id as course_id,
                c.name as course_name,
                s.id as student_id,
                u.full_name as student_name,
                COUNT(a.id) FILTER (WHERE a.status = 'absent') as total_absences,
                COUNT(a.id) FILTER (WHERE a.status = 'late') as total_lates
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON s.course_id = c.id
            LEFT JOIN attendance a ON a.student_id = s.id
                AND a.date >= $1 AND a.date <= $2
            WHERE u.school_id = $3
            GROUP BY c.id, c.name, s.id, u.full_name
            HAVING COUNT(a.id) FILTER (WHERE a.status = 'absent') > 0 
                OR COUNT(a.id) FILTER (WHERE a.status = 'late') > 0
            ORDER BY c.name ASC, total_absences DESC, u.full_name ASC;
        `, [startDate, endDate, schoolId]);

        response.status(200).json({
            attendanceSummary: result.rows
        });

    } catch (error) {
        console.error("Get Attendance Center Error:", error);
        response.status(500).json({ message: "Failed to fetch attendance center data" });
    } finally {
        client.release();
    }
}

export async function getAttendanceStatusByCalendar(
    request: AuthenticatedRequest,
    response: Response
){
    const creator = request.user!;
    const startDate = request.query.startDate as string;
    const endDate = request.query.endDate as string;
    const studentId = request.query.studentId as string;

    if (!startDate) {
        return response.status(400).json({ message: "startDate is required" });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
            d.calendar_date::date as date,
            CASE 
                WHEN count(a.id) = 0 THEN 'no_data'
                WHEN bool_or(a.status = 'absent') THEN 'absent'
                WHEN bool_or(a.status = 'late') THEN 'late'
                ELSE 'present'
            END as daily_status
            FROM generate_series(
                $1::date,
                LEAST($3::date, CURRENT_DATE),
                '1 day'::interval
            ) as d(calendar_date)
            LEFT JOIN attendance a 
            ON a.date = d.calendar_date::date 
                AND a.student_id = $2
            GROUP BY d.calendar_date
            ORDER BY d.calendar_date DESC;
        `, [startDate, studentId, endDate])

        response.status(200).json({
            attendanceByCalendar: result.rows
        })
    } catch (dbError) {
        console.error("Get Attendance By Calendar Error:", dbError);
        response.status(500).json({ message: "Failed to fetch attendance by calendar" });
    } finally {
        client.release();
    }
}

export async function getAttendanceCourseByClass(
    request: AuthenticatedRequest,
    response: Response
){
    const creator = request.user!;
    const courseId = request.params.courseId as string;
    const classId = request.params.classId as string;
    const startDate = request.query.startDate as string;
    const endDate = request.query.endDate as string;

    if (!startDate || !endDate) {
        return response.status(400).json({ message: "startDate and endDate is required" });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(`
            WITH CalendarDates AS (
                SELECT generate_series($1::date, $2::date, '1 day'::interval )::date AS calendar_date  
            ),
            CourseStudents AS (
                SELECT 
                    s.id as student_id,
                    u.full_name as name
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.course_id = $3
            )
            SELECT
                cs.student_id,
                cs.name,
                cd.calendar_date as date,
                COALESCE(a.status, 'no_data') as status
            FROM CourseStudents cs
            CROSS JOIN CalendarDates cd
            LEFT JOIN attendance a
                ON a.student_id = cs.student_id
                AND a.date = cd.calendar_date
                AND a.class_id = $4
            ORDER BY cs.name ASC, cd.calendar_date ASC;
        `, [startDate, endDate, courseId, classId])

        response.status(200).json({
            attendanceClass: result.rows
        })
    } catch (dbError) {
        console.error("Get Attendance By Course Error:", dbError);
        response.status(500).json({ message: "Failed to fetch attendance by course" });
    } finally {
        client.release();
    }
}