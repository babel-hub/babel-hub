import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload, CreateMonitoringMessagePayload, EscalateInfraction, GetStudentInfractionsByCoursePayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, MonitoringMessage, RawInfraction,
    StudentInfraction, StudentMonitoring, UpdateInfractionPayload
} from "../domain/Coexistence.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";

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
                WHERE mm.monitoring_id = $1
                  AND mm.is_deleted = false
                  AND m.school_id = $2
                ORDER BY mm.created_at ASC;
            `;

            const result = await client.query(query, [monitoringId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createMonitoringMessage(
        monitoringId: string,
        payload: CreateMonitoringMessagePayload,
        authUser: AuthUser
    ): Promise<MonitoringMessage> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT m.id
                FROM monitoring m
                WHERE m.id = $1
                  AND m.school_id = $2
                  AND m.is_deleted = false
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
                    monitoringId,
                    messageId: result.rows[0].id,
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
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    i.id,
                    i.student_id,
                    i.course_id,
                    i.class_id,
                    it.name AS infraction_type_name,
                    it.order_index AS infraction_type_order,
                    ia.name AS infraction_article_name,
                    i.infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number AS infraction_code_number,
                    sub.name AS class_name,
                    co.name AS course_name,
                    i.description,
                    i.location_context,
                    i.occurred_at,
                    i.reported_by,
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                    i.created_at,
                    i.published_to_guardian
                FROM infraction i
                    JOIN infraction_code ic ON ic.id = i.infraction_code_id
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
                    JOIN profile p ON p.id = i.reported_by
                    LEFT JOIN class cl ON i.class_id = cl.id
                    LEFT JOIN subject sub ON cl.subject_id = sub.id
                    LEFT JOIN course co ON i.course_id = co.id
                WHERE i.student_id = $1
                  AND i.class_id = $2
                  AND i.school_id = $3
                  AND i.is_deleted = false
                ORDER BY i.occurred_at DESC;
            `;

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
                    it.name AS infraction_type_name,
                    it.order_index AS infraction_type_order,
                    ia.name AS infraction_article_name,
                    i.infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number AS infraction_code_number,
                    i.description,
                    i.occurred_at,
                    m.reported_by,
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                    (
                        SELECT COUNT(*)::int
                        FROM monitoring_message mm
                        WHERE mm.monitoring_id = m.id AND mm.is_deleted = false
                    ) AS message_count,
                    m.created_at
                FROM monitoring m
                    LEFT JOIN course c ON c.id = m.course_id
                    JOIN infraction i ON i.id = m.infraction_id
                    JOIN infraction_code ic ON ic.id = i.infraction_code_id
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
                    JOIN profile p ON p.id = m.reported_by
                WHERE m.student_id = $1
                  AND m.course_id = $2
                  AND m.school_id = $3
                  AND m.is_deleted = false
                ORDER BY i.occurred_at DESC;
            `;

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
                    i.course_id,
                    i.class_id,
                    sub.name AS class_name,
                    co.name AS course_name,
                    it.name AS infraction_type_name,
                    it.order_index AS infraction_type_order,
                    ia.name AS infraction_article_name,
                    i.infraction_code_id,
                    ic.name AS infraction_code_name,
                    ic.number AS infraction_code_number,
                    i.description,
                    i.location_context,
                    i.occurred_at,
                    i.reported_by,
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                    i.created_at,
                    i.published_to_guardian
                FROM infraction i
                    JOIN infraction_code ic ON ic.id = i.infraction_code_id
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
                    JOIN profile p ON p.id = i.reported_by
                    LEFT JOIN class cl ON cl.id = i.class_id
                    LEFT JOIN subject sub ON sub.id = cl.subject_id
                    LEFT JOIN course co ON co.id = i.course_id
                WHERE i.student_id = $1
                  AND i.course_id = $2
                  AND i.school_id = $3
                  AND i.is_deleted = false
                ORDER BY i.occurred_at DESC;
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

    async publishInfraction(
        infractionId: string,
        published: boolean,
        authUser: AuthUser,
    ): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE infraction
                SET published_to_guardian = $1, updated_at = NOW()
                WHERE id = $2 AND school_id = $3 AND is_deleted = false
                RETURNING id
            `, [published, infractionId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("La infracción no existe en este colegio");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: published ? "PUBLISH_INFRACTION" : "UNPUBLISH_INFRACTION",
                schoolId: userSchoolId,
                metadata: { infractionId },
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async escalateInfraction(
        infractionId: string,
        payload: EscalateInfraction,
        authUser: AuthUser
    ): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT
                    i.reported_by,
                    i.student_id,
                    i.course_id
                FROM infraction i
                WHERE i.id = $1
                  AND i.school_id = $2
                  AND i.is_deleted = false
            `, [infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe o fue eliminada.");
            }

            const { reported_by, student_id, course_id } = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && reported_by !== userId) {
                throw new ForbiddenError("No estás autorizado para escalar esta infracción.");
            }

            if (payload.studentId !== student_id) {
                throw new ValidationError("El estudiante no coincide con la infracción");
            }
            if (payload.courseId !== course_id) {
                throw new ValidationError("El curso no coincide con la infracción");
            }

            const monitoringResult = await client.query(`
            INSERT INTO monitoring (
                school_id, infraction_id, student_id, course_id, notes, reported_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [
                userSchoolId,
                infractionId,
                student_id,
                course_id,
                payload.monitoringNotes ?? null,
                userId,
            ]);

            const monitoringId = monitoringResult.rows[0].id;

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "ESCALATE_MONITORING",
                schoolId: userSchoolId,
                metadata: {
                    infractionId,
                    monitoringId,
                    studentId: student_id,
                    courseId: course_id,
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
        payload: CreateInfractionPayload,
        authUser: AuthUser
    ): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        const isPrivileged = userRole === 'admin' || userRole === 'principal';

        try {
            await client.query('BEGIN');

            let resolvedCourseId: string;

            if (payload.classId) {
                const classCheck = await client.query(`
                    SELECT
                        co.id AS course_id,
                        (SELECT 1 FROM class cl2
                            JOIN teacher t ON cl2.teacher_id = t.id
                         WHERE cl2.id = $1 AND t.profile_id = $3) AS teacher_owns,
                        (SELECT 1 FROM course co2
                            JOIN teacher t ON co2.teacher_id = t.id
                         WHERE co2.id = co.id AND t.profile_id = $3) AS is_director
                    FROM class cl
                        JOIN course co ON co.id = cl.course_id
                    WHERE cl.id = $1 AND co.school_id = $2
                `, [payload.classId, userSchoolId, userId]);

                if (classCheck.rowCount === 0) {
                    throw new NotFoundError("La clase no existe en este colegio");
                }

                const { course_id, teacher_owns, is_director } = classCheck.rows[0];

                if (payload.courseId && payload.courseId !== course_id) {
                    throw new ValidationError("El curso no corresponde con la clase indicada");
                }

                resolvedCourseId = course_id;

                if (!isPrivileged && !teacher_owns && !is_director) {
                    throw new ForbiddenError("No tienes permisos para crear infracciones en esta clase");
                }
            } else {
                const courseCheck = await client.query(`
                    SELECT co.id,
                        (SELECT 1 FROM course co2
                            JOIN teacher t ON co2.teacher_id = t.id
                         WHERE co2.id = co.id AND t.profile_id = $3) AS is_director
                    FROM course co
                    WHERE co.id = $1 AND co.school_id = $2
                `, [payload.courseId, userSchoolId, userId]);

                if (courseCheck.rowCount === 0) {
                    throw new NotFoundError("El curso no existe en este colegio");
                }

                resolvedCourseId = payload.courseId;

                if (!isPrivileged && !courseCheck.rows[0].is_director) {
                    throw new ForbiddenError("No tienes permisos para crear infracciones en este curso");
                }
            }

            const studentCheck = await client.query(`
                SELECT 1 FROM student s
                    JOIN profile p ON p.id = s.profile_id
                WHERE s.id = $1
                  AND s.course_id = $2
                  AND p.school_id = $3
                  AND p.is_active = true
            `, [payload.studentId, resolvedCourseId, userSchoolId]);

            if (studentCheck.rowCount === 0) {
                throw new NotFoundError("El estudiante no pertenece a este curso");
            }

            const codeCheck = await client.query(`
                SELECT 1 FROM infraction_code ic
                    JOIN infraction_article ia ON ia.id = ic.article_id
                    JOIN infraction_type it ON it.id = ia.type_id
                WHERE ic.id = $1 AND it.school_id = $2 AND ic.is_active = true
            `, [payload.codeId, userSchoolId]);

            if (codeCheck.rowCount === 0) {
                throw new NotFoundError("El código de infracción no existe o pertenece a otro colegio");
            }

            const infractionResult = await client.query(`
                WITH inserted AS (
                INSERT INTO infraction (
                    school_id, student_id, course_id, class_id,
                    infraction_code_id, description, location_context, occurred_at, reported_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()), $9)
                    RETURNING id, infraction_code_id
                    )
                SELECT i.id,
                       it.name AS type_name,
                       ic.name AS code_name
                FROM inserted i
                         JOIN infraction_code ic ON ic.id = i.infraction_code_id
                         JOIN infraction_article ia ON ia.id = ic.article_id
                         JOIN infraction_type it ON it.id = ia.type_id
            `, [
                userSchoolId,
                payload.studentId,
                resolvedCourseId,
                payload.classId ?? null,
                payload.codeId,
                payload.description,
                payload.locationContext ?? null,
                payload.occurredAt ?? null,
                userId,
            ]);

            const infraction = infractionResult.rows[0];
            let monitoringId: string | null = null;

            if (payload.escalate) {
                const monitoringResult = await client.query(`
                    INSERT INTO monitoring (
                        school_id, infraction_id, student_id, course_id, notes, reported_by
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id
                `, [
                    userSchoolId,
                    infraction.id,
                    payload.studentId,
                    resolvedCourseId,
                    payload.monitoringNotes ?? null,
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
                    monitoringId,
                    studentId: payload.studentId,
                    courseId: resolvedCourseId,
                    classId: payload.classId ?? null,
                    locationContext: payload.locationContext ?? null,
                    typeName: infraction.type_name,
                    codeName: infraction.code_name,
                },
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            if (error.code === '23505') throw new ConflictError("Ya existe un monitoreo para esta infracción");
            if (error.code === '23503') throw new ConflictError("Alguna referencia es inválida (estudiante, curso o código)");
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
                    i.infraction_code_id AS old_code_id,
                    i.description        AS old_description,
                    i.location_context   AS old_location_context,
                    i.reported_by
                FROM infraction i
                WHERE i.id = $1
                  AND i.school_id = $2
                  AND i.is_deleted = false
            `, [payload.infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe en este colegio");
            }

            const { old_code_id, old_description, old_location_context, reported_by } = check.rows[0];

            const isPrivileged = userRole === 'admin' || userRole === 'principal';
            if (!isPrivileged && reported_by !== userId) {
                throw new ForbiddenError("No tienes permiso. Solo quien reportó la infracción puede editarla.");
            }

            const codeCheck = await client.query(`
                SELECT 1
                FROM infraction_code ic
                         JOIN infraction_article ia ON ia.id = ic.article_id
                         JOIN infraction_type it ON it.id = ia.type_id
                WHERE ic.id = $1
                  AND it.school_id = $2
                  AND ic.is_active = true
            `, [payload.codeId, userSchoolId]);

            if (codeCheck.rowCount === 0) {
                throw new NotFoundError("El código de infracción no existe o pertenece a otro colegio");
            }

            await client.query(`
                UPDATE infraction
                SET infraction_code_id = $1,
                    description        = $2,
                    location_context   = COALESCE($3, location_context),
                    updated_at         = NOW()
                WHERE id = $4
            `, [
                payload.codeId,
                payload.description,
                payload.locationContext ?? null,
                payload.infractionId,
            ]);

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
                    oldLocationContext: old_location_context,
                    newLocationContext: payload.locationContext ?? null,
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
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT
                    i.reported_by,
                    (SELECT m.id FROM monitoring m
                     WHERE m.infraction_id = i.id AND m.is_deleted = false) AS monitoring_id
                FROM infraction i
                WHERE i.id = $1
                  AND i.school_id = $2
                  AND i.is_deleted = false
            `, [infractionId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("La infracción no existe o ya fue eliminada");
            }

            const { reported_by, monitoring_id } = check.rows[0];

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

    async getDashboardStats(authUser: AuthUser): Promise<{
        unpublished_infractions: number;
        stale_monitorings: number;
    }> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    (SELECT COUNT(*)::int
                     FROM infraction
                     WHERE school_id = $1
                       AND is_deleted = false
                       AND published_to_guardian = false) AS unpublished_infractions,
    
                    (SELECT COUNT(*)::int
                     FROM monitoring m
                     WHERE m.school_id = $1
                       AND m.is_deleted = false
                       AND m.created_at < NOW() - interval '7 days'
                       AND NOT EXISTS (
                           SELECT 1 FROM monitoring_message mm
                           WHERE mm.monitoring_id = m.id
                             AND mm.is_deleted = false
                             AND mm.created_at > NOW() - interval '7 days'
                       )) AS stale_monitorings
            `, [userSchoolId]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }
}