import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabase } from "../services/index.js";
import { createAuditLog } from "../services/audit.service.js";

export async function registerStudent (
    request: AuthenticatedRequest,
    response: Response) {
    const { email,  password, fullName, enrolmentCode, courseId } = request.body;
    const creator = request.user!;

    try {
        const { data, error: supabaseError } =  await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (supabaseError) {
            if (supabaseError.code === 'email_exists') {
                return response.status(409).json({
                    message: "Ya existe un usuario registrado con esta dirección de correo electrónico."
                });
            }

            return response.status(supabaseError.status || 400).json({
                message: supabaseError.message
            });
        }

        const authUserId = data.user?.id;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const userResult = await client.query(`
                INSERT INTO users (supabase_user_id, role, school_id, email, full_name) 
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [authUserId, 'student', creator.schoolId, email, fullName]);

            const internalId = userResult.rows[0].id;

            await client.query(`
                INSERT INTO students (user_id, enrollment_code, course_id)
                VALUES ($1, $2, $3)
            `, [internalId, enrolmentCode, courseId]);

            await createAuditLog(client, {
                actorUserId: creator.userId as string,
                actorRole: creator.role as string,
                action: 'CREATE_STUDENT',
                targetUserId: authUserId,
                schoolId: creator.schoolId as string,
                metadata: {
                    email,
                    courseId,
                    enrolmentCode
                }
            });

            await client.query(`COMMIT`);

            response.status(200).json({
                "message": "Student created",
                "student": authUserId
            })
        } catch (dbError) {
            await client.query(`ROLLBACK`);
            await supabase.auth.admin.deleteUser(authUserId);

            console.error("Transaction Error - student creation rolled back:", dbError);
            response.status(500).json({
                message: "Database error: Student creation failed",
                error: dbError
            });
        } finally {
            client.release();
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to create student" });
    }
}

export async function getStudents(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT
                s.id as student_id,
                s.enrollment_code,
                s.created_at,
                c.name as course_name,
                c.id as course_id,
                u.full_name,
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON s.course_id = c.id
            WHERE u.school_id = $1
            ORDER BY u.full_name ASC
        `, [schoolId]);

        response.status(200).json(result.rows);
    } catch (dbError) {
        console.error("Database Error - GET Students failed:", dbError);
        response.status(500).json({ message: "Database error: Failed to fetch students" });
    } finally {
        client.release();
    }
}

export async function getStudentById(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { role, userId: authUserId, schoolId } = request.user!;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id as string)) {
        return response.status(400).json({ message: "Invalid UUID format" });
    }

    const client = await pool.connect();

    try {
        const studentQuery = await client.query(`
            SELECT
                s.id as student_id,
                s.enrollment_code,
                u.full_name,
                u.email,
                u.supabase_user_id,
                c.name as course_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON s.course_id = c.id
            WHERE s.id = $1 AND u.school_id = $2
        `, [id, schoolId]);

        if (studentQuery.rowCount === 0) {
            return response.status(404).json({ message: "Student not found" });
        }

        const studentInfo = studentQuery.rows[0];

        if (role === 'student' && studentInfo.supabase_user_id !== authUserId) {
            return response.status(403).json({ message: 'User not authorized to view this profile' });
        }

        const gradesQuery = await client.query(`
            SELECT 
                a.id as assignment_id,
                a.title as assignment_title,
                s.name,
                g.grade_value,
                g.graded_at
            FROM grades g
            JOIN assignments a ON g.assignments_id = a.id
            JOIN classes c ON a.class_id = c.id
            JOIN subjects s ON c.subject_id = s.id
            WHERE g.student_id = $1
            ORDER BY g.graded_at DESC
            LIMIT 5
        `, [id]);

        delete studentInfo.supabase_user_id;

        return response.status(200).json({
            id: studentInfo.student_id,
            full_name: studentInfo.full_name,
            email: studentInfo.email,
            course_name: studentInfo.course_name,
            enrollment_code: studentInfo.enrollment_code,
            recent_grades: gradesQuery.rows
        });

    } catch (dbError) {
        console.error("Database Error in getStudentById:", dbError);
        return response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function updateStudent(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { fullName, enrolmentCode, courseId } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const studentCheck = await client.query(`
            SELECT s.user_id, u.supabase_user_id 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1 AND u.school_id = $2
        `, [id, creator.schoolId]);

        if (studentCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Student not found or unauthorized" });
        }

        const { user_id, supabase_user_id } = studentCheck.rows[0];

        await client.query(`
            UPDATE users 
            SET full_name = $1 
            WHERE id = $2
        `, [fullName, user_id]);

        await client.query(`
            UPDATE students 
            SET enrollment_code = $1, course_id = $2 
            WHERE id = $3
        `, [enrolmentCode, courseId, id]);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role as string,
            action: 'UPDATE_STUDENT',
            targetUserId: supabase_user_id,
            schoolId: creator.schoolId as string,
            metadata: { studentId: id, fullName, enrolmentCode, courseId }
        });

        await client.query("COMMIT");
        response.status(200).json({ message: "Student updated successfully" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating student:", error);
        response.status(500).json({ message: "Failed to update student" });
    } finally {
        client.release();
    }
}

export async function deleteStudent(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const studentCheck = await client.query(`
            SELECT s.user_id, u.supabase_user_id, u.full_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1 AND u.school_id = $2
        `, [id, creator.schoolId]);

        if (studentCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Student not found or unauthorized" });
        }

        const { user_id, supabase_user_id, full_name } = studentCheck.rows[0];

        await client.query(`DELETE FROM students WHERE id = $1`, [id]);
        await client.query(`DELETE FROM users WHERE id = $1`, [user_id]);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role as string,
            action: 'DELETE_STUDENT',
            schoolId: creator.schoolId as string,
            metadata: { studentId: id, studentName: full_name }
        });

        const { error: supabaseError } = await supabase.auth.admin.deleteUser(supabase_user_id);

        if (supabaseError) {
            throw new Error(`Supabase deletion failed: ${supabaseError.message}`);
        }

        await client.query("COMMIT");
        response.status(200).json({ message: "Student deleted successfully" });

    } catch (error: any) {
        await client.query("ROLLBACK");

        if (error.code === '23503') {
            return response.status(409).json({
                message: "Cannot delete student because they have assigned grades or active records."
            });
        }

        console.error("Error deleting student:", error);
        response.status(500).json({ message: "Failed to delete student" });
    } finally {
        client.release();
    }
}