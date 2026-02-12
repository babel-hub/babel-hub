import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function getAttendance(
    request: AuthenticatedRequest,
    response: Response
) {
    const { role, userId, schoolId } = request.user!;

    try {
        let query = "";
        let params: any[] = [];

        switch (role) {
            case "student":
                query = `
                    SELECT a.*, sb.name as name
                    FROM attendance a
                    JOIN students s ON a.student_id = s.id
                    JOIN classes c ON a.class_id = c.id
                    JOIN subjects sb ON c.subject_id = sb.id
                    WHERE s.user_id = $1
                `;
                params = [userId];
                break;
            case "teacher":
                query = `
                    SELECT a.*, u.name as name
                    FROM attendance a
                    JOIN classes c ON a.class_id = c.id
                    JOIN teachers t ON c.teacher_id = t.id
                    JOIN students s ON a.student_id = s.id
                    JOIN users u ON t.user_id = u.id
                    WHERE t.user_id = $1
                `;
                params = [userId];
                break;
            case "principal":
                query = `
                    SELECT a.*, c.name as class_name
                    FROM attendance a
                    JOIN classes c ON a.class_id = c.id
                    JOIN subjects sb ON c.subject_id = sb.id
                    WHERE sb.school_id = $1
                `;
                params = [schoolId];
                break;
            default:
                return response.status(403).json({ message: "Role not authorized for attendance" });
        }

        const result = await pool.query(query, params);
        response.json(result.rows);
    } catch (error) {
        console.error("Get Attendance Error:", error);
        response.status(500).json({ message: "Failed to fetch attendance" });
    }
}

export async function upsertAttendance(
    request: AuthenticatedRequest,
    response: Response
) {
    const { status, studentId, classId } = request.body;
    const creator = request.user!;

    const isPrincipal = creator.role?.includes("principal");
    const isTeacher = creator.role?.includes("teacher");

    if (!isPrincipal && !isTeacher) {
        return response.status(403).json({ message: "Role not authorized" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (isTeacher) {
            const belongsToClass = await client.query(`
                SELECT 1 FROM classes 
                WHERE id = $1 AND teacher_id = (SELECT id FROM teachers WHERE user_id = $2)
            `, [classId, creator.userId]);

            if (belongsToClass.rowCount === 0) {
                await client.query("ROLLBACK");
                return response.status(403).json({ message: "You don't teach this class" });
            }
        } else if (isPrincipal) {
            const isInSchool = await client.query(`
                SELECT 1 FROM classes c
                JOIN subjects s ON c.subject_id = s.id
                WHERE c.id = $1 AND s.school_id = $2
            `, [classId, creator.schoolId]);

            if (isInSchool.rowCount === 0) {
                await client.query("ROLLBACK");
                return response.status(403).json({ message: "Class not in your school" });
            }
        }

        const result = await client.query(`
            INSERT INTO attendance (student_id, class_id, date, status)
            VALUES ($1, $2, CURRENT_DATE, $3)
            ON CONFLICT (student_id, class_id, date) 
            DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
                RETURNING student_id, class_id, date, status;
        `, [studentId, classId, status]);

        await client.query("COMMIT");

        return response.status(200).json({
            message: "Attendance recorded",
            attendance: result.rows[0]
        });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Attendance Error:", dbError);

        return response.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}