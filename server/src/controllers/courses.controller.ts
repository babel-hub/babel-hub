import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import { createAuditLog } from "../services/audit.service.js";

export async function createCourse(
    request: AuthenticatedRequest,
    response: Response,
) {
    const { name, year, teacherId } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            INSERT INTO courses (school_id, name, year, teacher_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [creator.schoolId, name, year, teacherId]);

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
                c.teacher_id as director_id,
                u.full_name as director_name,
                COUNT(s.id) as student_count
            FROM courses c
            JOIN teachers t ON c.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            LEFT JOIN students s ON c.id = s.course_id
            WHERE c.school_id = $1
            GROUP BY
                c.id,
                c.name,
                c.created_at,
                c.year,
                c.teacher_id,
                u.full_name
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

export async function updateCourse(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { name, year, teacherId } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            UPDATE courses 
            SET name = $1, year = $2, teacher_id = $3
            WHERE id = $4 AND school_id = $5
            RETURNING id, name
        `, [name, year, teacherId, id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Course not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "UPDATE_COURSE",
            schoolId: creator.schoolId!,
            metadata: {
                courseId: id,
                updatedFields: { name, year, teacherId }
            }
        });

        await client.query("COMMIT");

        response.status(200).json({ message: "Course updated successfully" });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Failed to update course" });
    } finally {
        client.release();
    }
}

export async function deleteCourse(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const checkQuery = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM students WHERE course_id = $1) as student_count,
                (SELECT COUNT(*) FROM classes WHERE course_id = $1) as class_count
        `, [id]);

        const studentCount = parseInt(checkQuery.rows[0].student_count);
        const classCount = parseInt(checkQuery.rows[0].class_count);

        if (studentCount > 0 || classCount > 0) {
            await client.query("ROLLBACK");
            return response.status(400).json({
                message: `No se puede eliminar este curso. Todavía tiene ${studentCount} estudiantes y ${classCount} clases asignadas. Por favor, reasígnalos primero.`
            });
        }

        const result = await client.query(`
            DELETE FROM courses 
            WHERE id = $1 AND school_id = $2
            RETURNING id, name
        `, [id, creator.schoolId]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Course not found or unauthorized" });
        }

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "DELETE_COURSE",
            schoolId: creator.schoolId!,
            metadata: {
                courseId: id,
                courseName: result.rows[0].name
            }
        });

        await client.query("COMMIT");

        response.status(200).json({ message: "Course deleted successfully" });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Database Error:", dbError);
        response.status(500).json({ message: "Failed to delete course" });
    } finally {
        client.release();
    }
}

export async function getAvailableSubjectsForCourse(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const { courseId } = request.params;

    if (!courseId) {
        return response.status(400).json({ message: "courseId is required" });
    }

    const client = await pool.connect();

    try {
        const query = `
            SELECT id, name 
            FROM subjects 
            WHERE school_id = $1
            AND id NOT IN (
                SELECT subject_id 
                FROM classes 
                WHERE course_id = $2
            )
            ORDER BY name ASC;
        `;

        const result = await client.query(query, [schoolId, courseId]);

        response.status(200).json({
            availableSubjects: result.rows
        });

    } catch (dbError) {
        console.error("Error fetching available subjects:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}