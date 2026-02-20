import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import { createAuditLog } from "../services/audit.service.js";

export async function createCourse(
    request: AuthenticatedRequest,
    response: Response,
) {
    const { name } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            INSERT INTO courses (school_id, name)
            VALUES ($1, $2)
                RETURNING id
        `, [creator.schoolId, name]);

        const newCourseId = result.rows[0].id;

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_COURSE",
            schoolId: creator.schoolId!,
            metadata: {
                courseId: newCourseId,
                name
            }
        });

        await client.query("COMMIT");

        response.status(201).json({
            message: "Course created successfully",
            courseId: newCourseId
        });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Failed to create course" });
    } finally {
        client.release();
    }
}

export async function getAllCourses(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        const query = `
            SELECT 
                c.id, 
                c.name as course_name,
                c.created_at,
                c.year,
                COUNT(s.id) as student_count
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id
            WHERE c.school_id = $1
            GROUP BY c.id
            ORDER BY c.name ASC;
        `;

        const result = await client.query(query, [schoolId]);

        response.status(200).json({
            courses: result.rows
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function getCourseDetails(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { schoolId } = request.user!;

    const client = await pool.connect();

    try {

        const courseQuery = await client.query(`
            SELECT id, name, created_at, year
            FROM courses 
            WHERE id = $1 AND school_id = $2
        `, [id, schoolId]);

        if (courseQuery.rowCount === 0) {
            return response.status(404).json({ message: "Course not found" });
        }

        const studentsQuery = await client.query(`
            SELECT u.full_name, u.email, st.id as student_id
            FROM students st
            JOIN users u ON st.user_id = u.id
            WHERE st.course_id = $1
            ORDER BY u.full_name ASC
        `, [id]);

        const classesQuery = await client.query(`
            SELECT cl.id as class_id, s.name as subject_name, u.full_name as teacher_name
            FROM classes cl
            JOIN subjects s ON cl.subject_id = s.id
            JOIN teachers t ON cl.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE cl.course_id = $1
        `, [id]);


        response.status(200).json({
            course: courseQuery.rows[0],
            students: studentsQuery.rows,
            classes: classesQuery.rows
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function changeStudentCourse(
    request: AuthenticatedRequest,
    response: Response
) {
    const { courseId, studentId } = request.params;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            UPDATE students
            SET course_id = $1
            WHERE id = $2 AND user_id IN (SELECT id FROM users WHERE school_id = $3)
                RETURNING id
        `, [courseId, studentId, creator.schoolId]);

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "TRANSFER_STUDENT_COURSE",
            targetUserId: studentId as string,
            schoolId: creator.schoolId!,
            metadata: { newCourseId: courseId }
        });

        await client.query("COMMIT");
        response.status(200).json({ message: "Student transferred to new course successfully" });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}