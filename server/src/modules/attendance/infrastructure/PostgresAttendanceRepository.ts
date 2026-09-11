import type {
    ClassAttendance,
    CourseDailyAttendance,
    BulkRecords,
    AttendanceSummary,
    CalendarAttendance,
    CourseAttendance,
    DailyAttendance
} from "../domain/Attendance.types.js";
import type { IAttendanceRepository } from "../domain/IAttendanceRepository.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { NotFoundError } from "../../errors/domain/CustomErrors.js";
import type {AuthUser} from "../../shared/domain/Shared.types.js";

export class PostgresAttendanceRepository implements IAttendanceRepository {
    async getDailyClassAttendance(classId: string, schoolId: string, date: string, isActive: boolean): Promise<ClassAttendance[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    s.id as student_id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name,
                    a.status,
                    a.date
                FROM class c
                JOIN student s ON s.course_id = c.course_id
                JOIN profile p ON s.profile_id = p.id
                LEFT JOIN attendance a ON a.student_id = s.id AND a.class_id = $1 AND a.date = $2
                WHERE c.id = $1 AND p.school_id = $3 AND p.is_active = $4
                ORDER BY p.first_last_name ASC;
            `, [classId, date, schoolId, isActive]);

            return result.rows;
        } finally {
            client.release();
        }
    }
    async getDailyCourseAttendance(courseId: string, schoolId: string, date: string, isActive: boolean): Promise<CourseDailyAttendance[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    s.id as student_id,
                    CASE
                        WHEN bool_or(a.status = 'present') THEN 'present'
                        WHEN bool_or(a.status = 'late') THEN 'late'
                        WHEN bool_or(a.status = 'absent') THEN 'absent'
                        WHEN bool_or(a.status = 'excused') THEN 'excused'
                        ELSE 'no_data'
                    END as daily_status
                FROM student s
                JOIN profile p ON s.profile_id = p.id
                LEFT JOIN class c ON c.course_id = s.course_id
                LEFT JOIN attendance a ON a.student_id = s.id AND a.class_id = c.id AND a.date = $1
                WHERE s.course_id = $2 AND p.school_id = $3 AND p.is_active = $4
                GROUP BY s.id
            `, [date, courseId, schoolId, isActive]);

            return result.rows;
        } finally {
            client.release()
        }

    }
    async bulkUpsertAttendance(classId: string, records: BulkRecords[], date: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const classCheck = await client.query(`
                SELECT 
                    c.id 
                FROM class c
                JOIN course co ON c.course_id = co.id
                WHERE c.id = $1 AND co.school_id = $2
            `, [classId, userSchoolId]);

            if (classCheck.rowCount === 0) {
                throw new NotFoundError("No fue posible guardar la asistencia");
            }

            const studentIds: string[] = records.map(r => r.studentId);
            const statuses: string[] = records.map(r => r.status);

            await client.query(`
                INSERT INTO attendance (student_id, class_id, date, status)
                SELECT unnest($1::uuid[]), $2, $3, unnest($4::text[])
                ON CONFLICT (student_id, class_id, date) 
                DO UPDATE SET
                    status = EXCLUDED.status,
                    updated_at = NOW();
            `, [studentIds, classId, date, statuses]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "TAKE_CLASS_ATTENDANCE",
                schoolId: userSchoolId,
                metadata: { classId, date, studentCount: records.length }
            });

            await client.query('COMMIT');
            return;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    async getAttendanceSummary(schoolId: string, startDate: string, endDate: string, isActive: boolean): Promise<AttendanceSummary[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
            WITH LastRecord AS (
                    SELECT
                        a.student_id,
                        MAX(a.date) as last_record
                    FROM attendance a
                    JOIN student s ON a.student_id = s.id
                    JOIN profile p ON s.profile_id = p.id
                    WHERE a.date >= $1 AND a.date <= $2
                        AND p.is_active = $4
                        AND p.school_id = $3
                    GROUP BY a.student_id
                ), CheckLastStatus AS (
                        SELECT 
                            a.student_id
                        FROM attendance a
                        JOIN LastRecord lr ON a.student_id = lr.student_id AND a.date = lr.last_record
                        GROUP BY a.student_id
                        HAVING BOOL_OR(a.status IN ('absent', 'late'))
                            AND NOT BOOL_OR(a.status = 'present')
                )
                SELECT
                    c.id as course_id,
                    c.name as course_name,
                    s.id as student_id,
                    p.first_name as student_first_name,
                    p.middle_name as student_middle_name,
                    p.first_last_name as student_first_last_name,
                    p.second_last_name as student_second_last_name,
                    COUNT(DISTINCT a.date) FILTER (WHERE a.status = 'absent') AS total_absences,
                    COUNT(s.id) FILTER (WHERE a.status = 'late') AS total_lates
                FROM CheckLastStatus cls
                JOIN student s ON cls.student_id = s.id
                JOIN profile p ON s.profile_id = p.id
                JOIN course c ON s.course_id = c.id
                JOIN attendance a ON s.id = a.student_id 
                WHERE p.school_id = $3
                AND a.date >= $1 AND a.date <= $2
                GROUP BY
                    c.id,
                    c.name,
                    s.id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name
                HAVING COUNT(DISTINCT a.date) FILTER (WHERE a.status = 'absent') > 0
                    OR COUNT(s.id) FILTER (WHERE a.status = 'late') > 0
                ORDER BY c.name::integer DESC, total_absences DESC, p.first_last_name ASC;
            `, [startDate, endDate, schoolId, isActive]);

            return result.rows;
        } finally {
            client.release()
        }
    }

    async getStudentDailyAttendance(studentId: string, date: string, authUser: AuthUser): Promise<DailyAttendance[]> {
        const client = await pool.connect();
        try {
            const check = await client.query(`
                SELECT 1
                FROM parent_student ps
                JOIN parent p ON ps.parent_id = p.id
                WHERE p.profile_id = $1 AND ps.student_id = $2
                LIMIT 1;
            `, [authUser.userId, studentId]);

            if (check.rowCount === 0) throw new NotFoundError("No tienes acceso a este estudiante");

            const query = `
                SELECT
                    c.id AS class_id,
                    sub.name AS class_name,
                    COALESCE(a.status, 'no_data') AS status,
                    a.created_at AS recorded_at
                FROM student s
                JOIN class c ON s.course_id = c.course_id
                JOIN subject sub ON c.subject_id = sub.id
                JOIN attendance a ON a.class_id = c.id
                AND a.student_id = s.id
                AND a.date = $1
                WHERE s.id = $2
                ORDER BY sub.name ASC;
            `;

            const result = await client.query(query, [date, studentId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getCalendarAttendance(studentId: string, startDate: string, endDate: string): Promise<CalendarAttendance[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    d.calendar_date::date AS date,
                    CASE 
                        WHEN COUNT(a.id) = 0 THEN 'no_data'
                        WHEN bool_or(a.status = 'absent') THEN 'absent'
                        WHEN bool_or(a.status = 'late') THEN 'late'
                        WHEN bool_or(a.status = 'excused') THEN 'excused'
                        ELSE 'present'
                    END as daily_status
                FROM generate_series(
                    $1::DATE,
                    LEAST($3::DATE, CURRENT_DATE),
                    '1 day'::INTERVAL
                ) AS d(calendar_date)
                LEFT JOIN attendance a 
                ON a.date = d.calendar_date::DATE
                    AND a.student_id = $2
                GROUP BY d.calendar_date
                ORDER BY d.calendar_date DESC;
            `, [startDate, studentId, endDate]);

            return result.rows;
        } finally {
            client.release()
        }
    }
    async getClassAttendance(courseId: string, classId: string, startDate: string, endDate: string): Promise<CourseAttendance[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                WITH CalendarDates AS (
                    SELECT generate_series($1::date, $2::date, '1 day'::interval )::date AS calendar_date  
                ),
                CourseStudents AS (
                    SELECT 
                        s.id as student_id,
                        p.first_name as student_first_name,
                        p.middle_name as student_middle_name,
                        p.first_last_name as student_first_last_name,
                        p.second_last_name as student_second_last_name
                    FROM student s
                    JOIN profile p ON s.profile_id = p.id
                    WHERE s.course_id = $3
                )
                SELECT
                    cs.student_id,
                    cs.student_first_name,
                    cs.student_middle_name,
                    cs.student_first_last_name,
                    cs.student_second_last_name,
                    cd.calendar_date AS date,
                    COALESCE(a.status, 'no_data') AS status
                FROM CourseStudents cs
                CROSS JOIN CalendarDates cd
                LEFT JOIN attendance a
                    ON a.student_id = cs.student_id
                    AND a.date = cd.calendar_date
                    AND a.class_id = $4
                ORDER BY cs.student_first_last_name ASC, cd.calendar_date ASC;
            `, [startDate, endDate, courseId, classId]);

            return result.rows;
        } finally {
            client.release()
        }
    }

}