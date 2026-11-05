import type { ICoexistenceRepository } from "../domain/ICoexistenceRepository.js";
import type {
    CreateInfractionPayload,
    GetStudentInfractionsPayload,
    GetStudentMonitoringPayload, InfractionType, Severity,
    StudentInfraction, StudentMonitoring
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
                 WHERE cl.id = $1 AND t.profile_id = $6) AS teacher_owns_class
        `, [classId, payload.studentId, payload.infractionTypeId, userSchoolId, userRole, userId]);

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
                RETURNING *
            )
            SELECT
                i.id,
                i.student_id,
                i.class_id,
                it.name AS infraction_name,
                it.severity,
                i.description,
                i.reported_by,
                CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                i.created_at
            FROM inserted i
                JOIN infraction_type it ON it.id = i.infraction_type_id
                JOIN profile p ON p.id = i.reported_by;
        `, [
                payload.studentId,
                classId,
                payload.infractionTypeId,
                payload.description,
                userId,
            ]);

            const infraction = infractionResult.rows[0];

            let monitoring: StudentMonitoring | null = null;
            if (payload.escalate) {
                const monitoringResult = await client.query(`
                WITH inserted AS (
                    INSERT INTO monitoring (infraction_id, student_id, course_id, notes, reported_by)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                )
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
                    CONCAT_WS(' ', p.first_name, p.middle_name, p.first_last_name, p.second_last_name) AS reported_by_name,
                    m.created_at
                FROM inserted m
                    JOIN course c ON c.id = m.course_id
                    JOIN infraction i ON i.id = m.infraction_id
                    JOIN infraction_type it ON it.id = i.infraction_type_id
                    JOIN profile p ON p.id = m.reported_by;
            `, [
                    infraction.id,
                    payload.studentId,
                    v.course_id,
                    payload.monitoringNotes ?? null,
                    userId,
                ]);

                monitoring = monitoringResult.rows[0];
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: payload.escalate ? "CREATE_INFRACTION_AND_MONITORING" : "CREATE_INFRACTION",
                schoolId: userSchoolId,
                metadata: {
                    infractionId: infraction.id,
                    monitoringId: monitoring?.id ?? null,
                    studentId: payload.studentId,
                    classId,
                    typeName: infraction.infraction_name,
                    severity: infraction.severity,
                },
            });

            await client.query('COMMIT');
            return;
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
}