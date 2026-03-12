import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import { createAuditLog } from "../services/audit.service.js";

export async function createClass(
    request: AuthenticatedRequest,
    response: Response,
) {
    const { courseId, subjectId, teacherId } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const ownershipCheck = await client.query(`
            SELECT 1 
            FROM courses c
            JOIN subjects s ON s.id = $2
            JOIN teachers t ON t.id = $3
            JOIN users tu ON t.user_id = tu.id
            WHERE c.id = $1 
            AND c.school_id = $4 
            AND s.school_id = $4 
            AND tu.school_id = $4
        `, [courseId, subjectId, teacherId, creator.schoolId]);

        if (ownershipCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(403).json({ message: "Invalid Course, Subject, or Teacher for this school" });
        }

        const result = await client.query(`
            INSERT INTO classes (course_id, subject_id, teacher_id)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [courseId, subjectId, teacherId]);

        const newClassId = result.rows[0].id;

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_CLASS",
            targetUserId: teacherId,
            schoolId: creator.schoolId!,
            metadata: {
                classId: newClassId,
                courseId,
                subjectId,
            }
        });

        await client.query("COMMIT");

        response.status(201).json({
            message: "Class created successfully",
            classId: newClassId
        });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Failed to create class" });
    } finally {
        client.release();
    }
}

export async function getAllClasses(
    request: AuthenticatedRequest,
    response: Response
) {
    const { subjects } = request.params;
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        let query = "";

        if (subjects) {
            query = `
                SELECT * FROM subjects WHERE school_id =$1
            `
        } else {
            query = `
            SELECT
                cl.id,
                c.name as course_name,
                s.name as subject_name,
                t.id as teacher_id,
                u.full_name as teacher_name
            FROM classes cl
            JOIN courses c ON cl.course_id = c.id
            JOIN subjects s ON cl.subject_id = s.id
            JOIN teachers t ON cl.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE c.school_id = $1
            ORDER BY c.name;
        `;
        }

        const result = await client.query(query, [schoolId]);

        response.status(200).json({
            classes: result.rows
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function getClassInfo(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        const classQuery = await client.query(`
            SELECT
                cl.id,
                cl.course_id,
                c.name as course_name,
                s.name as subject_name,
                u.full_name as teacher_name,
                t.id as teacher_id,
                cl.created_at
            FROM classes cl
            JOIN courses c ON cl.course_id = c.id
            JOIN subjects s ON cl.subject_id = s.id
            JOIN teachers t ON cl.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE cl.id = $1 AND c.school_id = $2
        `, [id, schoolId]);

        if (classQuery.rowCount === 0) {
            return response.status(404).json({ message: "Class not found" });
        }

        const courseId = classQuery.rows[0].course_id;

        const studentsQuery = await client.query(`
            SELECT u.full_name, u.email, st.id as student_id
            FROM students st
            JOIN users u ON st.user_id = u.id
            WHERE st.course_id = $1
            ORDER BY u.full_name ASC
        `, [courseId]);

        const assignmentsQuery = await client.query(`
            SELECT id, title, type, due_date
            FROM assignments
            WHERE class_id = $1
            ORDER BY due_date ASC
        `, [id]);

        response.status(200).json({
            details: classQuery.rows[0],
            students: studentsQuery.rows,
            assignments: assignmentsQuery.rows
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}


// TEACHERS CONTROLLERS

export async function getTeacherClasses(
    request: AuthenticatedRequest,
    response: Response
){
    const user = request.user!;

    if (user.role !== "teacher") {
        return response.status(403).json({ message: "Forbidden" });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                cl.id as class_id,
                s.name as subject_name,
                co.name as course_name,
                co.id as course_id,
                COUNT(s.id) as total_students
            FROM classes cl
            JOIN subjects s ON cl.subject_id = s.id
            JOIN courses co ON cl.course_id = co.id
            LEFT JOIN students st ON co.id = st.course_id
            JOIN teachers t ON cl.teacher_id = t.id
            WHERE t.user_id = $1 AND co.school_id = $2 
            GROUP BY cl.id,
                     s.name,
                     co.name,
                     co.id
            ORDER BY co.name, s.name;
        `, [user.userId, user.schoolId]);

        response.status(200).json({
            teacherClasses: result.rows
        });
    } catch (dbError) {
        console.error("Database Error in getTeacherClasses:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function getTeacherClassDetails(
    request: AuthenticatedRequest,
    response: Response
){
    const { classId } = request.params;
    const user = request.user!;

    if (user.role !== "teacher") {
        return response.status(403).json({ message: "Forbidden" });
    }

    const client = await pool.connect();

    try {
        const classDetails = await client.query(`
            SELECT
                sb.name AS subject_name,
                cs.name AS course_name,
                s.user_id AS student_id,
                u.full_name AS student_name
            FROM classes cl
            JOIN courses cs ON cl.course_id = cs.id
            JOIN subjects sb ON cl.subject_id = sb.id
            JOIN teachers t ON cl.teacher_id = t.id
            LEFT JOIN students s ON s.course_id = cs.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE cl.id = $1
            AND cs.school_id = $2
            AND t.user_id = $3
            ORDER BY u.full_name ASC
        `, [classId, user.schoolId, user.userId]);

        const rows = classDetails.rows;

        if (rows.length === 0) {
            return response.status(404).json({ message: "Class not found or unauthorized" });
        }

        const classInfo = {
            subject_name: rows[0].subject_name,
            course_name: rows[0].course_name,
        };

        const studentsList = rows
            .filter(row => row.student_id !== null)
            .map(row => ({
                student_id: row.student_id,
                student_name: row.student_name
            }));

        response.status(200).json({
            teacherClass: {
                subject_name: classInfo.subject_name,
                course_name: classInfo.course_name,
                total_students: studentsList.length,
                students: studentsList
            }
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}