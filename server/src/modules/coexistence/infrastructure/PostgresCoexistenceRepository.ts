import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload, EscalateInfraction,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionType, Severity,
    StudentInfraction, StudentMonitoring, UpdateInfractionPayload
} from "../domain/Coexistence.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import {createAuditLog} from "../../../services/audit.service.js";
import {ConflictError, ForbiddenError, NotFoundError} from "../../errors/domain/CustomErrors.js";

export class PostgresCoexistenceRepository implements ICoexistenceRepository {
    async getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    i.id,
                    i.student_id,
                    i.class_id,
                    i.infraction_type_id,
                    it.name AS infraction_name,
                    it.severity,
                    i.description,
                    i.reported_by,
                    CONCAT_WS(' ', p.second_last_name, p.first_last_name, p.first_name, p.middle_name) AS reported_by_name,
                    i.created_at
                FROM infraction i
                    JOIN infraction_type it ON it.id = i.infraction_type_id
                    JOIN profile p ON p.id = i.reported_by
                    JOIN class cl ON cl.id = i.class_id
                    JOIN course co ON co.id = cl.course_id
                WHERE i.student_id = $1
                  AND i.class_id = $2
                  AND i.is_deleted = false
                  AND co.school_id = $3
                ORDER BY i.created_at DESC;
            `

            const result = await client.query(query, [payload.studentId, payload.classId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getStudentMonitoring(payload: GetStudentMonitoringPayload, authUser: AuthUser): Promise<StudentMonitoring[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    m.id,
                    m.infraction_id,
                    m.student_id,
                    m.course_id,
                    c.name AS course_name,
                    m.notes,
                    it.name AS infraction_name,
                    it.severity,
                    i.description,
                    m.reported_by,
                    CONCAT_WS(' ', p.second_last_name, p.first_last_name, p.first_name, p.middle_name) AS reported_by_name,
                    m.created_at
                FROM monitoring m
                    JOIN course c ON c.id = m.course_id
                    JOIN infraction i ON i.id = m.infraction_id
                    JOIN infraction_type it ON it.id = i.infraction_type_id
                    JOIN profile p ON p.id = m.reported_by
                WHERE m.student_id = $1
                  AND m.course_id = $2
                  AND m.is_deleted = false
                  AND c.school_id = $3
                ORDER BY m.created_at DESC;
            `

            const result = await client.query(query, [payload.studentId, payload.courseId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getInfractionTypes(authUser: AuthUser): Promise<InfractionType[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT id, name, severity
                FROM infraction_type
                WHERE school_id = $1 AND is_active = true
                ORDER BY severity DESC, name ASC
            `, [userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async escalateInfraction(infractionId: string, payload: EscalateInfraction, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let monitoringId: string | null = null;
            const monitoring = await client.query(`
                    INSERT INTO monitoring (infraction_id, student_id, course_id, notes, reported_by)
                    VALUES ($1, $2, $3, $4, $5)
                        RETURNING id;
                `, [
                infractionId,
                payload.studentId,
                payload.courseId,
                payload.monitoringNotes,
                userId,
            ]);
            monitoringId = monitoring.rows[0].id;

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "ESCALATE_MONITORING",
                schoolId: userSchoolId,
                metadata: {
                    infractionId: infractionId,
                    monitoringId: monitoringId,
                    studentId: payload.studentId,
                    course: payload.courseId
                },
            });

            await client.query("COMMIT");
        } catch (error : any) {
            await client.query("ROLLBACK");

            if (error.code === '23505') {
                throw new ConflictError("Esta infracción ya fue escalada a monitoreo.");
            }
            if (error.code === '23503') {
                throw new ConflictError("Alguna referencia es inválida (estudiante, curso o infracción)");
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async createInfraction(
        classId: string,
        payload: CreateInfractionPayload,
        authUser: AuthUser
    ): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const validation = await client.query(`
                SELECT
                    (SELECT co.id
                     FROM class cl
                        JOIN course co ON cl.course_id = co.id
                     WHERE cl.id = $1 AND co.school_id = $4) AS course_id,
                    (SELECT 1
                     FROM student s
                        JOIN profile p ON s.profile_id = p.id
                        JOIN class cl ON cl.course_id = s.course_id
                     WHERE s.id = $2
                       AND cl.id = $1
                       AND p.school_id = $4
                       AND p.is_active = true) AS student_valid,
                    (SELECT 1
                     FROM infraction_type
                     WHERE id = $3 AND school_id = $4 AND is_active = true) AS type_valid,
                    (SELECT 1
                     FROM class cl
                        JOIN teacher t ON cl.teacher_id = t.id
                     WHERE cl.id = $1 AND t.profile_id = $5) AS teacher_owns_class
            `, [classId, payload.studentId, payload.infractionTypeId, userSchoolId, userId]);

            const v = validation.rows[0];

            if (!v.course_id) throw new NotFoundError("La clase no existe en este colegio");
            if (!v.student_valid) throw new NotFoundError("El estudiante no pertenece a esta clase");
            if (!v.type_valid) throw new NotFoundError("El tipo de infracción no existe o está inactivo");

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && !v.teacher_owns_class) {
                throw new ForbiddenError("No tienes permisos para crear infracciones en esta clase");
            }

            const infractionResult = await client.query(`
                WITH inserted AS (
                INSERT INTO infraction (student_id, class_id, infraction_type_id, description, reported_by)
                VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, infraction_type_id
                    )
                SELECT
                    i.id,
                    it.name AS infraction_name,
                    it.severity
                FROM inserted i
                    JOIN infraction_type it ON it.id = i.infraction_type_id;
            `, [
                payload.studentId,
                classId,
                payload.infractionTypeId,
                payload.description,
                userId,
            ]);

            const infraction = infractionResult.rows[0];

            let monitoringId: string | null = null;

            if (payload.escalate) {
                const monitoringResult = await client.query(`
                    INSERT INTO monitoring (infraction_id, student_id, course_id, notes, reported_by)
                    VALUES ($1, $2, $3, $4, $5)
                        RETURNING id;
                `, [
                    infraction.id,
                    payload.studentId,
                    v.course_id,
                    payload.monitoringNotes,
                    userId,
                ]);

                monitoringId = monitoringResult.rows[0].id;
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: payload.escalate ? "CREATE_INFRACTION_AND_MONITORING" : "CREATE_INFRACTION",
                schoolId: userSchoolId,
                metadata: {
                    infractionId: infraction.id,
                    monitoringId: monitoringId,
                    studentId: payload.studentId,
                    classId,
                    typeName: infraction.infraction_name,
                    severity: infraction.severity,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23505') {
                throw new ConflictError("Ya existe un monitoreo para esta infracción");
            }
            if (error.code === '23503') {
                throw new ConflictError("Alguna referencia es inválida (estudiante, clase o tipo)");
            }
            throw error;
        } finally {
            client.release();
        }
    }


    async updateInfraction(payload: UpdateInfractionPayload, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT
                    i.infraction_type_id AS old_type_id,
                    i.description AS old_description,
                    t.profile_id AS teacher_profile_id
                FROM infraction i
                    JOIN class cl ON cl.id = i.class_id
                    JOIN course co ON co.id = cl.course_id
                    JOIN teacher t ON cl.teacher_id = t.id
                WHERE i.id = $1
                  AND co.school_id = $2
                  AND i.is_deleted = false
            `, [payload.infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe en este colegio");
            }

            const { old_type_id, old_description, teacher_profile_id } = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            const isOwner = teacher_profile_id === userId;
            if (!isPrivileged && !isOwner) {
                throw new ForbiddenError("Solo el profesor que reportó la infracción puede editarla");
            }

            const typeCheck = await client.query(`
                SELECT 1 FROM infraction_type
                WHERE id = $1 AND school_id = $2 AND is_active = true
            `, [payload.infractionTypeId, userSchoolId]);

            if (typeCheck.rowCount === 0) {
                throw new NotFoundError("El tipo de infracción no existe o está inactiva");
            }

            await client.query(`
                UPDATE infraction
                SET infraction_type_id = $1, description = $2, updated_at = NOW()
                WHERE id = $3
            `, [payload.infractionTypeId, payload.description, payload.infractionId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_INFRACTION",
                schoolId: userSchoolId,
                metadata: {
                    infractionId: payload.infractionId,
                    oldTypeId: old_type_id,
                    newTypeId: payload.infractionTypeId,
                    oldDescription: old_description,
                    newDescription: payload.description,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new ConflictError("El tipo de infracción no existe");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteInfraction(infractionId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
            SELECT
                i.infraction_type_id,
                i.description,
                t.profile_id AS teacher_profile_id,
                (SELECT m.id FROM monitoring m WHERE m.infraction_id = i.id AND m.is_deleted = false) AS monitoring_id
            FROM infraction i
                JOIN class cl ON cl.id = i.class_id
                JOIN course co ON co.id = cl.course_id
                JOIN teacher t ON cl.teacher_id = t.id
            WHERE i.id = $1
              AND co.school_id = $2
              AND i.is_deleted = false
        `, [infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe o ya fue eliminada");
            }

            const { teacher_profile_id, monitoring_id } = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            const isOwner = teacher_profile_id === userId;
            if (!isPrivileged && !isOwner) {
                throw new ForbiddenError("Solo el profesor que reportó la infracción puede eliminarla");
            }

            await client.query(`
                UPDATE infraction SET is_deleted = true, updated_at = NOW()
                WHERE id = $1
            `, [infractionId]);

            // Cascade: soft delete the monitoring if it exists
            if (monitoring_id) {
                await client.query(`
                    UPDATE monitoring SET is_deleted = true, updated_at = NOW()
                    WHERE id = $1
                `, [monitoring_id]);
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_INFRACTION",
                schoolId: userSchoolId,
                metadata: {
                    infractionId,
                    cascadedMonitoringId: monitoring_id ?? null,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}