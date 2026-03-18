import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js"
import { supabase } from "../services/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function registerTeacher(
    request: AuthenticatedRequest,
    response: Response) {
    const { email, password, fullName } = request.body;
    const creator = request.user!;

    try {
        const { data, error: supabaseError } = await supabase.auth.admin.createUser({
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

            const result = await client.query(
                `INSERT INTO users (supabase_user_id, role, school_id, email, full_name) 
                VALUES ($1, 'teacher', $2, $3, $4)
                RETURNING id`,
                [authUserId, creator.schoolId, email, fullName]
            )

            const teacherId = result.rows[0].id;

            await client.query(
                `INSERT INTO teachers (user_id) 
                VALUES ($1)`,
                [teacherId]
            )

            await createAuditLog(client, {
                targetUserId: teacherId,
                actorUserId: creator.userId as string,
                actorRole: creator.role as string,
                action: "CREATE_TEACHER",
                schoolId:creator.schoolId as string,
                metadata: {
                    fullName,
                    email
                }
            })

            await client.query("COMMIT");

            response.status(200).json({
                "message": "teacher created",
                "teacher": teacherId
            })
        } catch (dbError) {
            await client.query("ROLLBACK");
            await supabase.auth.admin.deleteUser(authUserId);

            console.error("Transaction Error - Teacher creation rolled back:", dbError);
            response.status(500).json({ message: "Database error: Teacher creation failed" });
        } finally {
            client.release()
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to create teacher" });
    }
}

export async function getTeachers(
    request: AuthenticatedRequest,
    response: Response
) {
    const { available } = request.query;
    const client = await pool.connect();

    try {
        let queryText = `
            SELECT
                t.id,
                t.user_id,
                t.created_at,
                u.full_name,
                u.email,
                COUNT(cl.id)::int AS total_classes
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN classes cl ON cl.teacher_id = t.id
        `;

        if (available === 'true') {
            queryText += `
                LEFT JOIN courses co ON t.id = co.teacher_id
                WHERE co.teacher_id IS NULL
            `;
        }

        queryText += `
            GROUP BY t.id, t.user_id, t.created_at, u.full_name, u.email
            ORDER BY u.full_name ASC;
        `;

        const result = await client.query(queryText);

        response.status(200).json({
            teachers: result.rows
        });

    } catch (dbError) {
        console.error("Database Error - GET Teachers failed:", dbError);
        response.status(500).json({ message: "Database error: GET Teachers failed" });
    } finally {
        client.release();
    }
}

export async function getTeacherById(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { schoolId } = request.user!;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id as string)) {
        return response.status(400).json({ message: "Invalid UUID format" });
    }

    const client = await pool.connect();

    try {
        const teacherQuery = await client.query(`
            SELECT
                t.id as teacher_id,
                t.created_at,
                u.full_name,
                u.email
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1 AND u.school_id = $2
        `, [id, schoolId]);

        if (teacherQuery.rowCount === 0) {
            return response.status(404).json({ message: "Teacher not found" });
        }

        const classesQuery = await client.query(`
            SELECT 
                c.id as class_id,
                s.name as subject_name,
                co.name as course_name
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            JOIN courses co ON c.course_id = co.id
            WHERE c.teacher_id = $1
            ORDER BY co.name ASC
        `, [id]);

        return response.status(200).json({
            ...teacherQuery.rows[0],
            classes: classesQuery.rows
        });

    } catch (dbError) {
        console.error("Database Error in getTeacherById:", dbError);
        return response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function updateTeacher(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const { fullName } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const teacherCheck = await client.query(`
            SELECT t.user_id, u.supabase_user_id 
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1 AND u.school_id = $2
        `, [id, creator.schoolId]);

        if (teacherCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Teacher not found or unauthorized" });
        }

        const { user_id, supabase_user_id } = teacherCheck.rows[0];

        await client.query(`
            UPDATE users 
            SET full_name = $1 
            WHERE id = $2
        `, [fullName, user_id]);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role as string,
            action: 'UPDATE_TEACHER',
            targetUserId: supabase_user_id,
            schoolId: creator.schoolId as string,
            metadata: { teacherId: id, fullName }
        });

        await client.query("COMMIT");
        response.status(200).json({ message: "Teacher updated successfully" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating teacher:", error);
        response.status(500).json({ message: "Failed to update teacher" });
    } finally {
        client.release();
    }
}

export async function deleteTeacher(
    request: AuthenticatedRequest,
    response: Response
) {
    const { id } = request.params;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const teacherCheck = await client.query(`
            SELECT t.user_id, u.supabase_user_id, u.full_name
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1 AND u.school_id = $2
        `, [id, creator.schoolId]);

        if (teacherCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Teacher not found or unauthorized" });
        }

        const { user_id, supabase_user_id, full_name } = teacherCheck.rows[0];

        await client.query(`DELETE FROM teachers WHERE id = $1`, [id]);
        await client.query(`DELETE FROM users WHERE id = $1`, [user_id]);

        await createAuditLog(client, {
            actorUserId: creator.userId as string,
            actorRole: creator.role as string,
            action: 'DELETE_TEACHER',
            schoolId: creator.schoolId as string,
            metadata: { teacherId: id, teacherName: full_name }
        });

        const { error: supabaseError } = await supabase.auth.admin.deleteUser(supabase_user_id);

        if (supabaseError) {
            throw new Error(`Supabase deletion failed: ${supabaseError.message}`);
        }

        await client.query("COMMIT");
        response.status(200).json({ message: "Teacher deleted successfully" });

    } catch (error: any) {
        await client.query("ROLLBACK");

        if (error.code === '23503') {
            return response.status(409).json({
                message: "Cannot delete teacher because they are currently assigned to active classes or act as a course director."
            });
        }

        console.error("Error deleting teacher:", error);
        response.status(500).json({ message: "Failed to delete teacher" });
    } finally {
        client.release();
    }
}