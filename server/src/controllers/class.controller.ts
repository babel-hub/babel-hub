import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { pool } from "../db/index.js";
import {createAuditLog} from "../services/audit.service.js";

export async function createClass(
    request: AuthenticatedRequest,
    response: Response,
) {
    const { subjectId, teacherId, name } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    console.log(creator)
    try {
        await client.query("BEGIN");
        const ownershipCheck = await client.query(`
            SELECT 1 FROM subjects s
            JOIN teachers t ON t.id = $2
            WHERE s.id = $1 
            AND s.school_id = $3 
            AND t.user_id IN (SELECT id FROM users WHERE school_id = $3)
        `, [subjectId, teacherId, creator.schoolId]);

        if (ownershipCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return response.status(403).json({ message: "Invalid Subject or Teacher for this school" });
        }

        const result = await client.query(`
            INSERT INTO classes (subject_id, teacher_id, name)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [subjectId, teacherId, name]);

        const newClassId = result.rows[0].id;

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "CREATE_CLASS",
            targetUserId: teacherId,
            schoolId: creator.schoolId!,
            metadata: {
                classId: newClassId,
                subjectId,
                name
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

export async function assignStudentToClass(
    request: AuthenticatedRequest,
    response: Response
) {
    const { classId } = request.params;
    const { studentId } = request.body;
    const creator = request.user!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            INSERT INTO class_enrollments (class_id, student_id)
            VALUES ($1, $2)
        `, [classId, studentId]);

        await createAuditLog(client, {
            actorUserId: creator.userId!,
            actorRole: creator.role!,
            action: "ASSIGN_STUDENT",
            targetUserId: studentId,
            schoolId: creator.schoolId!,
            metadata: { classId }
        });

        await client.query("COMMIT");

        response.status(200).json({ message: "Student assigned successfully" });

    } catch (dbError: any) {
        await client.query("ROLLBACK");

        if (dbError.code === '23505') {
            return response.status(409).json({ message: "Student is already enrolled in this class" });
        }

        console.error("Database Error:", dbError);
        return response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}

export async function getAllClasses(
    request: AuthenticatedRequest,
    response: Response
) {
    const { schoolId } = request.user!;

    const client = await pool.connect();

    try {
        const query = `
            SELECT
                c.id,
                c.name as class_name,
                s.name as subject_name,
                t.user_id as teacher_id,
                u.full_name as teacher_name
            FROM classes c
                     JOIN subjects s ON c.subject_id = s.id
                     JOIN teachers t ON c.teacher_id = t.id
                     JOIN users u ON t.user_id = u.id
            WHERE s.school_id = $1 
        `;

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
                c.id,
                c.name as class_name,
                s.name as subject_name,
                u.full_name as teacher_name,
                t.id as teacher_id,
                c.created_at
            FROM classes c
                     JOIN subjects s ON c.subject_id = s.id
                     JOIN teachers t ON c.teacher_id = t.id
                     JOIN users u ON t.user_id = u.id
            WHERE c.id = $1 AND s.school_id = $2
        `, [id, schoolId]);

        if (classQuery.rowCount === 0) {
            return response.status(404).json({ message: "Class not found" });
        }

        const studentsQuery = await client.query(`
            SELECT u.full_name, u.email, s.id as student_id
            FROM class_enrollments ce
            JOIN students s ON ce.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE ce.class_id = $1
        `, [id]);

        response.status(200).json({
            details: classQuery.rows[0],
            students: studentsQuery.rows
        });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return response.status(500).json({ message: "Database error" });
    } finally {
        client.release();
    }
}