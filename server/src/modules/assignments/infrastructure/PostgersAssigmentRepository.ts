import type { IAssignmentRepository } from "../domain/IAssignmentRepository.js";
import type {
    AssignmentsByTeacherAndDate,
    AssignmentsOverview,
    UpdateAssignmentDTO
} from "../domain/Assignment.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type {ValidScales} from "../../grade/domain/Grade.types.js";
import type {AuthUser} from "../../shared/domain/Shared.types.js";

export class PostgresAssignmentRepository implements IAssignmentRepository {
    async getAssignmentsOverview(courseId: string, classId: string, periodId: string, userSchoolId: string): Promise<AssignmentsOverview> {
        const client = await pool.connect();
        try {
            const ownershipCheck = await client.query(`
                SELECT 1 FROM course WHERE id = $1 AND school_id = $2
            `, [courseId, userSchoolId]);

            if (ownershipCheck.rowCount === 0) throw new NotFoundError("Curso no encontrado o no tienes acceso a este");

            const assessments = await client.query(`
                SELECT
                    ac.id,
                    ac.name,
                    ac.weight::float AS weight
                FROM assessment_criteria ac
                JOIN subject s ON ac.grading_template_id = s.grading_template_id
                WHERE s.id = (SELECT subject_id FROM class WHERE id = $1)
                ORDER BY ac.name ASC
            `, [classId]);

            const assignments = await client.query(`
                SELECT
                    a.id,
                    a.name,
                    a.due_date,
                    a.created_at,
                    a.assessment_criteria_id
                FROM assignment a
                WHERE a.class_id = $1 and a.period_id = $2
                ORDER BY a.name ASC
            `, [classId, periodId]);

            const assignmentsByCriteria = new Map<string, any[]>();

            for (const asg of assignments.rows) {
                const list = assignmentsByCriteria.get(asg.assessment_criteria_id) ?? [];
                list.push({
                    id: asg.id,
                    name: asg.name,
                    due_date: asg.due_date,
                    created_at: asg.created_at
                });
                assignmentsByCriteria.set(asg.assessment_criteria_id, list);
            }

            return {
                assessment_criteria: assessments.rows.map(ac => ({
                    id: ac.id,
                    name: ac.name,
                    weight: ac.weight,
                    assignments: assignmentsByCriteria.get(ac.id) ?? []
                })),
            }
        } finally {
            client.release();
        }
    }

    async getAssignmentOwner(assignmentId: string): Promise<string | null> {
        const client = await pool.connect();
        try {
            const query = await client.query(`
                SELECT
                    t.profile_id AS id
                FROM assignment asg
                         JOIN class cl ON asg.class_id = cl.id
                         JOIN teacher t ON cl.teacher_id = t.id
                WHERE asg.id = $1
            `, [assignmentId]);

            if (query.rowCount === 0) {
                return null;
            }

            return query.rows[0].id;
        } finally {
            client.release();
        }
    }

    async getAssignmentsByTeacherAndDate(teacherProfileId: string, startDate: string, endDate: string): Promise<AssignmentsByTeacherAndDate[]> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT
                    a.id AS assignment_id,
                    a.name AS assignment_name,
                    a.created_at AS assignment_created_at,
                    a.due_date AS assignment_due_date,
                    c.course_id,
                    co.name AS course_name,
                    c.id AS class_id,
                    s.name AS subject_name,
                    c.teacher_id
                FROM assignment a
                JOIN class c ON a.class_id = c.id
                JOIN course co ON c.course_id = co.id
                JOIN subject s ON c.subject_id = s.id
                JOIN teacher t ON c.teacher_id = t.id
                WHERE t.profile_id = $1
                  AND c.is_active = true
                  AND a.due_date::DATE >= $2::DATE
                  AND a.due_date::DATE <= $3::DATE
                ORDER BY a.due_date ASC;
            `;

            const result = await client.query(query, [teacherProfileId, startDate, endDate]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createAssignment(
        assignmentName: string,
        assignmentDueAt: string,
        classId: string,
        assessmentId: string,
        periodId: string,
        authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ownershipCheck = await client.query(`
                SELECT 1
                FROM class cl
                JOIN course c ON cl.course_id = c.id
                JOIN subject s ON cl.subject_id = s.id
                JOIN assessment_criteria ac ON ac.grading_template_id = s.grading_template_id
                WHERE cl.id = $1 AND ac.id = $2 AND c.school_id = $3
            `, [classId, assessmentId, authUser.userSchoolId]);

            if (ownershipCheck.rowCount === 0) throw new NotFoundError("No se puede crear la asignación: clase o criterio inválido");

            const assignment = await client.query(`
            INSERT INTO assignment (name, due_date, class_id, assessment_criteria_id, period_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [assignmentName, assignmentDueAt, classId, assessmentId, periodId]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "CREATE_ASSIGNMENT",
                schoolId: authUser.userSchoolId,
                metadata: { assignmentId: assignment.rows[0].id, assignmentName: assignmentName }
            })

            await client.query('COMMIT');
            return;
        } catch (error: unknown) {
            await client.query('ROLLBACK');
            if (error instanceof Error && 'code' in error && error.code === '23503') {
                throw new ConflictError("La clase o el criterio seleccionado no existe");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async updateAssignment(
        assignmentId: string,
        payload: UpdateAssignmentDTO,
        authUser: AuthUser
    ): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ownershipCheck = await client.query(`
                SELECT 1
                FROM assignment a
                JOIN class c ON a.class_id = c.id
                JOIN course cr ON c.course_id = cr.id
                WHERE a.id = $1
                AND cr.school_id = $2
            `, [assignmentId, authUser.userSchoolId]);

            if (ownershipCheck.rowCount === 0) throw new NotFoundError("No se puede editar la asignación: clase o criterio inválido");

            const clauses: string[] = [];
            const values: any[] = [];
            let index = 1;

            if (payload.assignmentName !== undefined) {
                clauses.push(`name = $${index++}`);
                values.push(payload.assignmentName);
            }

            if (payload.assignmentDueAt !== undefined) {
                clauses.push(`due_date = $${index++}`);
                values.push(payload.assignmentDueAt);
            }

            values.push(assignmentId);

            if (clauses.length === 0) {
                throw new ValidationError('Debe proporcionar al menos un campo para actualizar');
            }

            const query = `
                UPDATE assignment
                SET ${clauses.join(', ')}
                WHERE id = $${index}
            `

            await client.query(query, values);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "UPDATE_ASSIGNMENT",
                schoolId: authUser.userSchoolId,
                metadata: { assignmentId: assignmentId, assignmentFields: payload }
            })

            await client.query('COMMIT');
            return;
        } catch (error: unknown) {
            await client.query('ROLLBACK');
            if (error instanceof Error && 'code' in error && error.code === '23503') {
                throw new ConflictError("La clase o el criterio seleccionado no existe");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteAssignment(assignmentId: string, authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ownershipCheck = await client.query(`
                SELECT 1
                FROM assignment a
                JOIN class c ON a.class_id = c.id
                JOIN course cr ON c.course_id = cr.id
                WHERE a.id = $1
                AND cr.school_id = $2
            `, [assignmentId, authUser.userSchoolId]);

            if (ownershipCheck.rowCount === 0) throw new NotFoundError("No se puede eliminar la asignación: clase o criterio inválido");

            const assignment = await client.query(`
                DELETE FROM assignment WHERE id = $1
                RETURNING id, name
            `, [assignmentId]);

            if (assignment.rowCount === 0) {
                throw new NotFoundError("La asignación no existe");
            }

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "DELETE_ASSIGNMENT",
                schoolId: authUser.userSchoolId,
                metadata: { assignmentId: assignmentId, assignmentName: assignment.rows[0].name }
            })

            await client.query('COMMIT');
            return;
        } catch (error: unknown) {
            await client.query('ROLLBACK');
            if (error instanceof Error && 'code' in error && error.code === '23503') {
                throw new ConflictError("La asignación tiene calificaciones existentes");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}