import type { IGradeRepository } from "../domain/IGradeRepository.js";
import type {
    GradeByAssignment,
    GradeRecord,
    StudentDailyGrade,
    StudentGrade,
    ValidScales
} from "../domain/Grade.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { ConflictError, NotFoundError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";
import {getRawAsset} from "node:sea";

export class PostgresGradeRepository implements IGradeRepository {
    async getGradesByClass(classId: string): Promise<GradeByAssignment[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    g.id,
                    g.student_id,
                    g.assignment_id,
                    g.value::float AS value,
                    g.comment
                FROM grade g
                JOIN assignment a ON g.assignment_id = a.id
                WHERE a.class_id = $1
            `, [classId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]> {
        const client = await pool.connect();
        try {
            const check = await client.query(`
                SELECT 1
                FROM parent_student ps
                JOIN parent p ON ps.parent_id = p.id
                WHERE p.profile_id = $1 AND ps.student_id = $2
                    LIMIT 1;
            `, [authUser.userId, studentId]);

            if (check.rowCount === 0) throw new NotFoundError("No tienes acceso a este estudiante");

            const result = await client.query(`
                WITH CriteriaAverages AS (
                    SELECT
                        c.id AS class_id,
                        sub.name AS subject_name,
                        ac.id AS criteria_id,
                        ac.weight,
                        AVG(g.value) AS criteria_avg,
                        sc.max_value,
                        sc.min_value,
                        sc.passing_value
                    FROM student s
                    JOIN class c ON s.course_id = c.course_id
                    JOIN subject sub ON c.subject_id = sub.id
                    JOIN grading_template gt ON sub.grading_template_id = gt.id
                    JOIN scale sc ON gt.scale_id = sc.id
                    JOIN assessment_criteria ac ON gt.id = ac.grading_template_id
                    LEFT JOIN assignment a
                        ON c.id = a.class_id
                            AND a.assessment_criteria_id = ac.id
                            AND a.period_id = $2

                    LEFT JOIN grade g
                        ON a.id = g.assignment_id
                            AND g.student_id = s.id
                    
                    WHERE s.id = $1
                    GROUP BY c.id, sub.name, ac.id, ac.weight, sc.max_value, sc.min_value, sc.passing_value
                )
                SELECT
                    class_id,
                    subject_name,
                    COALESCE(ROUND(SUM(criteria_avg * (weight / 100.0))::numeric, 1)::float, 0) AS final_grade,
                    max_value AS scale_max,
                    min_value AS scale_min,
                    passing_value
                FROM CriteriaAverages
                GROUP BY class_id, subject_name, max_value, min_value, passing_value
                ORDER BY subject_name ASC;
            `, [studentId, periodId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getStudentDailyGrades(studentId: string, date: string, authUser: AuthUser): Promise<StudentDailyGrade[]> {
        const client = await pool.connect();
        try {
            const check = await client.query(`
                SELECT 1
                FROM parent_student ps
                JOIN parent p ON ps.parent_id = p.id
                WHERE p.profile_id = $1 AND ps.student_id = $2
                LIMIT 1;
            `, [authUser.userId, studentId]);

            if (check.rowCount === 0) throw new NotFoundError("No tienes acceso a este estudiante");

            const grades = await client.query(`
                SELECT
                    c.id AS class_id,
                    sub.name AS subject_name,
                    ass.id AS assignment_id,
                    ass.name AS assignment_name,
                    ac.name AS criteria_name,
                    g.value AS grade,
                    g.comment AS comment,
                    g.created_at AS graded_at
                FROM student st
                JOIN class c ON st.course_id = c.course_id
                JOIN subject sub ON c.subject_id = sub.id
                JOIN assignment ass ON c.id = ass.class_id
                JOIN assessment_criteria ac ON ass.assessment_criteria_id = ac.id
                JOIN grade g ON st.id = g.student_id AND ass.id = g.assignment_id
                WHERE st.id = $1
                  AND g.value IS NOT NULL
                  AND (g.created_at AT TIME ZONE 'America/Bogota')::DATE = $2
                ORDER BY sub.name ASC;
            `, [studentId, date]);

            return grades.rows;
        } finally {
            client.release();
        }
    }

    async bulkUpsertGrades(assignmentId: string, records: GradeRecord[], authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ownershipCheck = await client.query(`
                SELECT 1
                FROM assignment a
                JOIN class cl ON a.class_id = cl.id
                JOIN course c ON cl.course_id = c.id
                WHERE a.id = $1 AND c.school_id = $2
            `, [assignmentId, authUser.userSchoolId]);

            if (ownershipCheck.rowCount === 0) throw new NotFoundError("Asignación no encontrada o sin acceso");

            const students: string[] = records.map(record => (record.studentId));
            const values: number[] = records.map((record) => (record.value));
            const comments: (string | null)[] = records.map(record => record.comment ?? null);

            await client.query(`
                INSERT INTO grade (value, assignment_id, student_id, comment)
                SELECT unnest($1::numeric[]), $2::uuid, unnest($3::uuid[]), unnest($4::text[])
                ON CONFLICT(student_id, assignment_id)
                DO UPDATE SET value = EXCLUDED.value, comment = EXCLUDED.comment, updated_at = NOW();
            `, [values, assignmentId, students, comments]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "BULK_UPSERT_GRADES",
                schoolId: authUser.userSchoolId,
                metadata: { assignmentId, studentCount: records.length }
            })

            await client.query('COMMIT');
            return;
        } catch (error : any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') throw new ConflictError("Uno o más estudiantes o la asignación no existen");
            throw error;
        } finally {
            client.release();
        }
    }
}