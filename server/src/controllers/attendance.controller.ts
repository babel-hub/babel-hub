import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function getAttendance(
    req: AuthenticatedRequest,
    res: Response
) {
    const { role, userId, schoolId } = req.user!;

    try {
        let query = "";
        let params: any[] = [];

        switch (role) {
            case "student":
                query = `
                    SELECT a.*, c.name as class_name 
                    FROM attendance a
                    JOIN students s ON a.student_id = s.id
                    JOIN classes c ON a.class_id = c.id
                    WHERE s.user_id = $1
                `;
                params = [userId];
                break;
            case "teacher":
                query = `
                    SELECT a.*, s.name as student_name
                    FROM attendance a
                    JOIN classes c ON a.class_id = c.id
                    JOIN teachers t ON c.teacher_id = t.id
                    JOIN students s ON a.student_id = s.id
                    WHERE t.user_id = $1
                `;
                params = [userId];
                break;
            case "principal":
                query = `
                    SELECT a.*, c.name as class_name
                    FROM attendance a
                    JOIN classes c ON a.class_id = c.id
                    WHERE c.school_id = $1
                `;
                params = [schoolId];
                break;
            default:
                return res.status(403).json({ message: "Role not authorized for attendance" });
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get Attendance Error:", error);
        res.status(500).json({ message: "Failed to fetch attendance" });
    }
}

export async function upsertAttendance(
    request: AuthenticatedRequest,
    response: Response
) {
    const { role, userId, schoolId } = request.user!;
    const { student_id, class_id, date, status } = request.body;

    if (!["teacher", "principal"].includes(role!)) {
        return response.status(403).json({ message: "Forbidden" });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        if (role === "teacher") {
            const teacherCheck = await client.query(
                `SELECT 1 FROM classes c
                JOIN teachers t ON c.teacher_id = t.id
                WHERE c.id = $1 AND t.user_id = $2`,
                [class_id, userId]
            );
            if (teacherCheck.rowCount === 0) {
                await client.query("ROLLBACK");
                return response.status(403).json({ message: "Not your class" });
            }
        }

        if (role === "principal") {
            const principalCheck = await client.query(
                `SELECT 1 FROM classes WHERE id = $1 AND school_id = $2`,
                [class_id, schoolId]
            );
            if (principalCheck.rowCount === 0) {
                await client.query("ROLLBACK");
                return response.status(403).json({ message: "Class not in your school" });
            }
        }

        await client.query(
            `INSERT INTO attendance (student_id, class_id, date, status)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (student_id, class_id, date)
            DO UPDATE SET status = EXCLUDED.status`,
            [student_id, class_id, date, status]
        );

        await createAuditLog(client, {
            actorUserId: userId as string,
            actorRole: role as string,
            targetUserId: student_id,
            schoolId: schoolId as string,
            action: "UPSERT_ATTENDANCE",
            metadata: { class_id, date, status }
        });

        await client.query("COMMIT");
        response.status(201).json({ message: "Successfully updated attendance" });

    } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("Transaction Error:", dbError);
        response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function test(req: AuthenticatedRequest, res: Response) {
    res.send({message: "Test"});
}

