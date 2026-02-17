import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabase } from "../services/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function registerStudent (
    request: AuthenticatedRequest,
    response: Response) {
    const { email,  password, fullName, enrollmentCode } = request.body;
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
                INSERT INTO students (user_id, enrollment_code)
                VALUES ($1, $2)
            `, [internalId, enrollmentCode]);

            await createAuditLog(client, {
                actorUserId: creator.userId as string,
                actorRole: creator.role as string,
                action: 'CREATE_STUDENT',
                targetUserId: authUserId,
                schoolId: creator.schoolId as string,
                metadata: {
                    email,
                    enrollmentCode
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

export async function getStudents (
    request: AuthenticatedRequest,
    response: Response) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            SELECT  
                s.id,
                s.enrollment_code,
                s.created_at,
                u.full_name,
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            ORDER BY created_at DESC`);

        await client.query("COMMIT");

        response.status(200).json(result.rows);
    } catch (dbError) {
        await client.query("ROLLBACK");

        console.error("Transaction Error - GET Students rolled back:", dbError);
        response.status(500).json({ message: "Database error: GET Students failed" });
    } finally {
        client.release();
    }
}

export async function getStudentById(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { role, userId: authUserId } = request.user!;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id as string)) {
        return response.status(404).json({ message: "UUID not found" });
    }

    const client = await pool.connect();

    try {
        const student = await client.query(`
            SELECT s.*, u.supabase_user_id
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `, [id]);

        if (student.rowCount === 0) {
            return response.status(404).json({ message: "Student not found" });
        }

        const studentInfo = student.rows[0];

        if (role === 'student' && studentInfo.supabase_user_id !== authUserId) {
            return response.status(403).json({ message: 'User no authorized' });
        }

        delete studentInfo.supabase_user_id;

        return response.status(200).json({
            student: studentInfo
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return response.status(500).json({
            message: "Database error",
            error: dbError,
            id: id
        });
    } finally {
        client.release();
    }
}