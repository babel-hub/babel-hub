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

        if (supabaseError) return response.status(400).send({ message:  `Supabase Error: ${supabaseError.message}` });

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