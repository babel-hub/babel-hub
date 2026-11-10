import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload, CreateMonitoringMessagePayload, EscalateInfraction, GetStudentInfractionsByCoursePayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionTypeHierarchy, MonitoringMessage, RawInfraction,
    StudentInfraction, StudentMonitoring, UpdateInfractionPayload
} from "../domain/Coexistence.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import {createAuditLog} from "../../../services/audit.service.js";
import {ConflictError, ForbiddenError, NotFoundError, ValidationError} from "../../errors/domain/CustomErrors.js";

export class PostgresCoexistenceRepository implements ICoexistenceRepository {
    async getMonitoringMessages(monitoringId: string, authUser: AuthUser): Promise<MonitoringMessage[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
            SELECT 
                mm.id,
                mm.monitoring_id,
                mm.profile_id,
                CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS profile_name,
                mm.message,
                mm.is_deleted,
                mm.created_at
            FROM monitoring_message mm
                JOIN profile p ON p.id = mm.profile_id
                JOIN monitoring m ON m.id = mm.monitoring_id
                JOIN course c ON c.id = m.course_id
            WHERE mm.monitoring_id = $1 
              AND mm.is_deleted = false
              AND c.school_id = $2
            ORDER BY mm.created_at ASC;
        `;

            const result = await client.query(query, [monitoringId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createMonitoringMessage(monitoringId: string, payload: CreateMonitoringMessagePayload, authUser: AuthUser): Promise<MonitoringMessage> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT m.id
                FROM monitoring m
                    JOIN course c ON c.id = m.course_id
                WHERE m.id = $1 AND c.school_id = $2 AND m.is_deleted = false
            `, [monitoringId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("El monitoreo no existe o no tienes acceso");
            }

            const insertQuery = `
                WITH inserted AS (
                    INSERT INTO monitoring_message (monitoring_id, profile_id, message)
                    VALUES ($1, $2, $3)
                        RETURNING id, monitoring_id, profile_id, message, created_at, is_deleted
                )
                SELECT
                    i.*,
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS profile_name
                FROM inserted i
                    JOIN profile p ON p.id = i.profile_id;
            `;

            const result = await client.query(insertQuery, [monitoringId, userId, payload.message.trim()]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_MONITORING_MESSAGE",
                schoolId: userSchoolId,
                metadata: {
                    monitoringId: monitoringId,
                    messageId: result.rows[0].id
                },
            });

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getStudentInfractions(payload: GetStudentInfractionsPayload, authUser: AuthUser): Promise<StudentInfraction[]> {
        const {userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    i.id,
                    i.student_id,
                    i.class_id,
                    it.name AS infraction_type_name,
                    it.order_index AS infraction_type_order,
                    ia.name AS infraction_article_name,
                    i.infraction_code_id AS infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number  AS infraction_code_number,
                    i.description,
                    i.reported_by,
                    CONCAT_WS(' ', p.second_last_name, p.first_last_name, p.first_name, p.middle_name) AS reported_by_name,
                    i.created_at
                FROM infraction i
                         JOIN infraction_code ic ON ic.id = i.infraction_code_id
                         JOIN infraction_article ia ON ia.id = ic.article_id
                         JOIN infraction_type it ON it.id = ia.type_id
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
        const {userSchoolId} = authUser;
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
                    it.name AS infraction_type_name,
                    it.order_index AS infraction_type_order,
                    ia.name AS infraction_article_name,
                    i.infraction_code_id AS infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number AS infraction_code_number,
                    i.description,
                    m.reported_by,
                    CONCAT_WS(' ', p.second_last_name, p.first_last_name, p.first_name,p.middle_name) AS reported_by_name,
                    (
                        SELECT COUNT(*)::int
                        FROM monitoring_message mm
                        WHERE mm.monitoring_id = m.id AND mm.is_deleted = false
                    ) AS message_count,
                    m.created_at
                FROM monitoring m
                    JOIN course c ON c.id = m.course_id
                    JOIN infraction i ON i.id = m.infraction_id
                    JOIN infraction_code ic ON ic.id = i.infraction_code_id
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
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

    async getStudentInfractionsByCourse(
        payload: GetStudentInfractionsByCoursePayload,
        authUser: AuthUser
    ): Promise<StudentInfraction[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    i.id,
                    i.student_id,
                    i.class_id,
                    sub.name AS class_name,
                    i.infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number AS infraction_code_order,
                    ia.name AS infraction_article_name,
                    it.name AS infraction_name,
                    it.order_index AS infraction_type_order,
                    i.description,
                    i.reported_by,
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                    i.created_at
                FROM infraction i
                    JOIN infraction_code ic ON ic.id = i.infraction_code_id
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
                    JOIN profile p ON p.id = i.reported_by
                    JOIN class cl ON cl.id = i.class_id
                    JOIN subject sub ON cl.subject_id = sub.id
                    JOIN course co ON co.id = cl.course_id
                WHERE i.student_id = $1
                  AND co.id = $2
                  AND co.school_id = $3
                  AND i.is_deleted = false
                ORDER BY i.created_at DESC;
            `;

            const result = await client.query(query, [
                payload.studentId,
                payload.courseId,
                userSchoolId,
            ]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getInfractionTypes(authUser: AuthUser): Promise<RawInfraction[]> {
        const {userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            const result = await client.query(`
                SELECT
                    it.id AS type_id,
                    it.name AS type_name,
                    it.order_index,
                    ia.id AS article_id,
                    ia.number AS article_number,
                    ia.name AS article_name,
                    ic.id AS code_id,
                    ic.number AS code_number,
                    ic.name AS code_name
                FROM infraction_type it
                    LEFT JOIN infraction_article ia ON ia.type_id = it.id AND ia.is_active = true
                    LEFT JOIN infraction_code ic ON ic.article_id = ia.id AND ic.is_active = true
                WHERE it.school_id = $1
                  AND it.is_active = true
                ORDER BY it.order_index, ia.number, ic.number
            `, [userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async escalateInfraction(infractionId: string, payload: EscalateInfraction, authUser: AuthUser): Promise<void> {
        const {userId, userRole, userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const check = await client.query(`
                SELECT i.reported_by
                FROM infraction i
                    JOIN class cl ON cl.id = i.class_id
                    JOIN course co ON co.id = cl.course_id
                WHERE i.id = $1
                  AND co.school_id = $2
                  AND i.is_deleted = false
            `, [infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe o fue eliminada.");
            }

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && check.rows[0].reported_by !== userId) {
                throw new ForbiddenError("No estás autorizado para escalar esta infracción.");
            }

            let monitoringId: string | null = null;
            const monitoring = await client.query(`
                INSERT INTO monitoring (infraction_id, student_id, course_id, notes, reported_by)
                VALUES ($1, $2, $3, $4, $5) RETURNING id;
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
        } catch (error: any) {
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
        const {userId, userRole, userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const validation = await client.query(`
                SELECT (SELECT co.id
                        FROM class cl
                                 JOIN course co ON cl.course_id = co.id
                        WHERE cl.id = $1
                          AND co.school_id = $4)   AS course_id,

                       (SELECT 1
                        FROM student s
                                 JOIN profile p ON s.profile_id = p.id
                                 JOIN class cl ON cl.course_id = s.course_id
                        WHERE s.id = $2
                          AND cl.id = $1
                          AND p.school_id = $4
                          AND p.is_active = true)  AS student_valid,

                       (SELECT 1
                        FROM infraction_code ic
                                 JOIN infraction_article ia ON ia.id = ic.article_id
                                 JOIN infraction_type it ON it.id = ia.type_id
                        WHERE ic.id = $3
                          AND it.school_id = $4
                          AND ic.is_active = true) AS code_valid,

                       (SELECT 1
                        FROM class cl
                                 JOIN teacher t ON cl.teacher_id = t.id
                        WHERE cl.id = $1
                          AND t.profile_id = $5)   AS teacher_owns_class
            `, [classId, payload.studentId, payload.codeId, userSchoolId, userId]);

            const v = validation.rows[0];

            if (!v.course_id) throw new NotFoundError("La clase no existe en este colegio");
            if (!v.student_valid) throw new NotFoundError("El estudiante no pertenece a esta clase");
            if (!v.code_valid) throw new NotFoundError("El código de infracción no existe o pertenece a otro colegio");

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && !v.teacher_owns_class) {
                throw new ForbiddenError("No tienes permisos para crear infracciones en esta clase");
            }

            const infractionResult = await client.query(`
                WITH inserted AS (
                    INSERT
                    INTO infraction (student_id, class_id, infraction_code_id, description, reported_by)
                    VALUES ($1, $2, $3, $4, $5)
                        RETURNING id, infraction_code_id
                )
                SELECT i.id,
                       it.name AS type_name,
                       ic.name AS code_name
                FROM inserted i
                         JOIN infraction_code ic ON ic.id = i.infraction_code_id
                         JOIN infraction_article ia ON ia.id = ic.article_id
                         JOIN infraction_type it ON it.id = ia.type_id;
            `, [
                payload.studentId,
                classId,
                payload.codeId,
                payload.description,
                userId,
            ]);

            const infraction = infractionResult.rows[0];
            let monitoringId: string | null = null;

            if (payload.escalate) {
                const monitoringResult = await client.query(`
                    INSERT INTO monitoring (infraction_id, student_id, course_id, notes, reported_by)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id;
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
                    typeName: infraction.type_name,
                    codeName: infraction.code_name,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23505') throw new ConflictError("Ya existe un monitoreo para esta infracción");
            if (error.code === '23503') throw new ConflictError("Alguna referencia es inválida (estudiante, clase o tipo)");
            throw error;
        } finally {
            client.release();
        }
    }


    async updateInfraction(payload: UpdateInfractionPayload, authUser: AuthUser): Promise<void> {
        const {userId, userRole, userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT i.infraction_code_id AS old_code_id,
                       i.description        AS old_description,
                       i.reported_by
                FROM infraction i
                         JOIN class cl ON cl.id = i.class_id
                         JOIN course co ON co.id = cl.course_id
                WHERE i.id = $1
                  AND co.school_id = $2
                  AND i.is_deleted = false
            `, [payload.infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe en este colegio");
            }

            const {old_code_id, old_description, reported_by} = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && reported_by !== userId) {
                throw new ForbiddenError("No tienes permiso. Solo quien reportó la infracción puede editarla.");
            }

            const typeCheck = await client.query(`
                SELECT 1
                FROM infraction_code ic
                         JOIN infraction_article ia ON ia.id = ic.article_id
                         JOIN infraction_type it ON it.id = ia.type_id
                WHERE ic.id = $1
                  AND it.school_id = $2
                  AND ic.is_active = true
            `, [payload.codeId, userSchoolId]);

            if (typeCheck.rowCount === 0) {
                throw new NotFoundError("El código de infracción no existe o pertenece a otro colegio");
            }

            await client.query(`
                UPDATE infraction
                SET infraction_code_id = $1,
                    description        = $2,
                    updated_at         = NOW()
                WHERE id = $3
            `, [payload.codeId, payload.description, payload.infractionId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_INFRACTION",
                schoolId: userSchoolId,
                metadata: {
                    infractionId: payload.infractionId,
                    oldCodeId: old_code_id,
                    newCodeId: payload.codeId,
                    oldDescription: old_description,
                    newDescription: payload.description,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23503') throw new ConflictError("El código de infracción no existe");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteInfraction(infractionId: string, authUser: AuthUser): Promise<void> {
        const {userId, userRole, userSchoolId} = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT
                    i.reported_by,
                    (SELECT m.id FROM monitoring m WHERE m.infraction_id = i.id AND m.is_deleted = false) AS monitoring_id
                FROM infraction i
                    JOIN class cl ON cl.id = i.class_id
                    JOIN course co ON co.id = cl.course_id
                WHERE i.id = $1
                  AND co.school_id = $2
                  AND i.is_deleted = false
            `, [infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe o ya fue eliminada");
            }

            const {reported_by, monitoring_id} = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && reported_by !== userId) {
                throw new ForbiddenError("No tienes permiso. Solo quien reportó la infracción puede eliminarla.");
            }

            await client.query(`
                UPDATE infraction
                SET is_deleted = true,
                    updated_at = NOW()
                WHERE id = $1
            `, [infractionId]);

            if (monitoring_id) {
                await client.query(`
                    UPDATE monitoring
                    SET is_deleted = true,
                        updated_at = NOW()
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