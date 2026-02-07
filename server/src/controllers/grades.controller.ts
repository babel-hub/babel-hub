import type { Response } from "express";
import { pool } from "../db/index.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {createAuditLog} from "../services/audit.service.js";

export async function getGrades(
    request: AuthenticatedRequest,
    response: Response,
) {
    const { role, userId, schoolId } = request.user!;

    try {
        let query = "";
        let params:any[] = [];

        if (role === "student") {
            query = `
                SELECT g.* 
                FROM grades g 
                JOIN students s ON  g.student_id = s.id 
                WHERE s.user_id = $1
            `;
            params = [userId];
        }

        if (role === "teacher") {
            query = `
                SELECT g.*
                FROM grades g
                JOIN classes c ON g.class_id = c.id
                JOIN teachers t ON c.teacher_id = t.id
                WHERE t.user_id = $1
            `;
            params = [userId];
        }

        if (role === "principal") {
            query = `
                SELECT g.*
                FROM grades g
                JOIN classes c ON g.class_id = c.id
                JOIN subjects s ON c.subject_id = s.id
                WHERE s.school_id = $1
            `;
            params = [schoolId];
        }

        const client = await pool.connect();

        try {
             await client.query("BEGIN");

             const result = await pool.query(query, params);
             await createAuditLog(client, {
                 actorUserId: userId as string,
                 schoolId: schoolId as string,
                 actorRole: role as string,
                 action: "GET_GRADES",
                 targetUserId: userId as string,
                 metadata: {
                     action: "GET"
                 }
             })

             response.json(result.rows);
        } catch (dbError) {
            await client.query("ROLLBACK");

            console.error("Transaction Error - GET Grades rolled back:", dbError);
            response.status(500).json({ message: "Database error: GET Grades failed" });
        } finally {
            client.release()
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to fetch grades" });
    }
}

export async function upsertGrade(
    request: AuthenticatedRequest,
    response: Response
) {
    const { role, userId, schoolId } = request.user!;
    const { student_id, class_id, grade_value } = request.body;

    if (!["teacher", "principal"].includes(role!)) {
        return response.status(403).json({ message: "Forbidden" });
    }

    try {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            if (role === "teacher") {
                const ownershipCheck = await client.query(
                    `
                    SELECT 1
                    FROM classes c
                    JOIN teachers t ON c.teacher_id = t.id
                    WHERE c.id = $1 AND t.user_id = $2
                `,
                    [class_id, userId]
                );

                if (ownershipCheck.rowCount === 0) {
                    await client.query("ROLLBACK");
                    return response.status(403).json({ message: "Not your class" });
                }
            }

            await client.query(
                `INSERT INTO grades (student_id, class_id, grade_value)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (student_id, class_id) 
                        DO UPDATE SET grade_value = EXCLUDED.grade_value, updated_at = now()`,
                [student_id, class_id, grade_value]
            );

            await createAuditLog(client, {
                actorUserId: userId as string,
                targetUserId: student_id,
                actorRole: role as string,
                schoolId: schoolId as string,
                action: "UPSERT_GRADE",
                metadata: {
                    class_id,
                    grade_value
                }
            })

            await client.query("COMMIT");

            response.status(200).json({
                message: "Grades saved successfully"
            })
        } catch (dbError) {
            await client.query("ROLLBACK");

            console.error("Transaction Error - UPSERT Grades rolled back:", dbError);
            response.status(500).json({ message: "Database error: UPSERT Grades failed" });
        } finally {
            client.release()
        }
    } catch (error) {
        response.status(500).json({ message: "Failed to save grade" });
    }
}
