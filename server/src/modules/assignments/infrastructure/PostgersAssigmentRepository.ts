import type {
    IAssignmentRepository
} from "../domain/IAssignmentRepository.js";
import type {
    Assignments,
    AssignmentsByTeacherAndDate,
    UpdateAssignmentDTO,
    GetAssignmentsOverviewPayload,
    CreateAssignmentPayload
} from "../domain/Assignment.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";

export class PostgresAssignmentRepository implements IAssignmentRepository {
    async hasAssignmentsForSubject(subjectId: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 1
                FROM assignment a
                         JOIN class c ON a.class_id = c.id
                WHERE c.subject_id = $1
                    LIMIT 1
            `;

            const result = await client.query(query, [subjectId]);
            return (result.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    }

    async getAssignmentsOverview(
        payload: GetAssignmentsOverviewPayload,
        authUser: AuthUser
    ): Promise<Assignments[]> {
        const { courseId, classId, periodId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const ownershipCheck = await client.query(`
                SELECT 1
                FROM class cl
                         JOIN course c ON cl.course_id = c.id
                WHERE cl.id = $1 AND c.id = $2 AND c.school_id = $3
            `, [classId, courseId, userSchoolId]);

            if (ownershipCheck.rowCount === 0) {
                throw new NotFoundError("Curso o clase no encontrados, o sin acceso.");
            }

            const assignments = await client.query(`
                SELECT
                    a.id,
                    a.name,
                    a.due_date,
                    a.created_at,
                    a.assessment_criteria_id
                FROM assignment a
                WHERE a.class_id = $1 AND a.period_id = $2
                ORDER BY a.created_at ASC
            `, [classId, periodId]);

            return assignments.rows;
        } finally {
            client.release();
        }
    }

    async getAssignmentOwner(assignmentId: string, authUser: AuthUser): Promise<string | null> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT t.profile_id AS id
                FROM assignment asg
                         JOIN class cl ON asg.class_id = cl.id
                         JOIN course c ON cl.course_id = c.id
                         JOIN teacher t ON cl.teacher_id = t.id
                WHERE asg.id = $1 AND c.school_id = $2
            `, [assignmentId, userSchoolId]);

            if (result.rowCount === 0) return null;
            return result.rows[0].id;
        } finally {
            client.release();
        }
    }

    async getAssignmentsByTeacherAndDate(
        teacherProfileId: string,
        startDate: string,
        endDate: string,
        authUser: AuthUser
    ): Promise<AssignmentsByTeacherAndDate[]> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
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
                JOIN profile p ON t.profile_id = p.id
                WHERE p.id = $1
                  AND p.school_id = $4
                  AND c.is_active = true
                  AND a.due_date::DATE >= $2::DATE
                  AND a.due_date::DATE <= $3::DATE
                ORDER BY a.due_date ASC
            `, [teacherProfileId, startDate, endDate, userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async createAssignment(payload: CreateAssignmentPayload, authUser: AuthUser): Promise<void> {
        const { assignmentName, assignmentDueAt, classId, assessmentId, periodId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

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
            `, [classId, assessmentId, userSchoolId]);

            if (ownershipCheck.rowCount === 0) {
                throw new NotFoundError("No se puede crear la asignación: clase o criterio inválido");
            }

            const assignment = await client.query(`
                INSERT INTO assignment (name, due_date, class_id, assessment_criteria_id, period_id)
                VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
            `, [assignmentName, assignmentDueAt, classId, assessmentId, periodId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_ASSIGNMENT",
                schoolId: userSchoolId,
                metadata: {
                    assignmentId: assignment.rows[0].id,
                    assignmentName
                }
            });

            await client.query('COMMIT');
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
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const ownershipCheck = await client.query(`
                SELECT 1
                FROM assignment a
                         JOIN class c ON a.class_id = c.id
                         JOIN course cr ON c.course_id = cr.id
                WHERE a.id = $1 AND cr.school_id = $2
            `, [assignmentId, userSchoolId]);

            if (ownershipCheck.rowCount === 0) {
                throw new NotFoundError("No se puede editar la asignación: no existe o no pertenece a este colegio.");
            }

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

            if (clauses.length === 0) {
                throw new ValidationError("Debe proporcionar al menos un campo para actualizar");
            }

            values.push(assignmentId);

            await client.query(`
                UPDATE assignment
                SET ${clauses.join(', ')}
                WHERE id = $${index}
            `, values);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_ASSIGNMENT",
                schoolId: userSchoolId,
                metadata: { assignmentId, assignmentFields: payload }
            });

            await client.query('COMMIT');
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
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM assignment a
                    USING class c, course cr
                WHERE a.class_id = c.id
                  AND c.course_id = cr.id
                  AND a.id = $1
                  AND cr.school_id = $2
                    RETURNING a.id, a.name
            `, [assignmentId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("No se puede eliminar la asignación: no existe o no pertenece a este colegio.");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_ASSIGNMENT",
                schoolId: userSchoolId,
                metadata: {
                    assignmentId,
                    assignmentName: result.rows[0].name
                }
            });

            await client.query('COMMIT');
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