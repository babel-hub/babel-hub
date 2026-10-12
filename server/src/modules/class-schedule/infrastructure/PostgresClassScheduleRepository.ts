import type {
    IClassScheduleRepository
} from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { TeacherSchedule, UpdateSchedule, UpsertSchedule, CheckOverlapPayload } from "../domain/ClassSchedule.types.js";
import { pool } from "../../../db/index.js";
import { ForbiddenError, NotFoundError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";
import type { PoolClient } from "pg";

export class PostgresClassScheduleRepository implements IClassScheduleRepository {

    private async verifyClassAccess(client: PoolClient, classId: string, authUser: AuthUser): Promise<void> {
        if (authUser.userRole === 'teacher') {
            const check = await client.query(`
                SELECT 1 FROM class c
                    JOIN teacher t ON c.teacher_id = t.id
                    JOIN profile p ON t.profile_id = p.id
                WHERE p.id = $1 AND p.school_id = $2 AND c.id = $3
            `, [authUser.userId, authUser.userSchoolId, classId]);

            if (check.rowCount === 0) {
                throw new ForbiddenError("No tienes permisos para modificar los horarios de esta clase");
            }
        } else if (authUser.userRole === 'principal' || authUser.userRole === 'admin') {
            const checkSchool = await client.query(`
                SELECT 1 FROM class c
                                  JOIN course co ON c.course_id = co.id
                WHERE c.id = $1 AND co.school_id = $2
            `, [classId, authUser.userSchoolId]);

            if (checkSchool.rowCount === 0) {
                throw new ForbiddenError("La clase no pertenece a tu institución");
            }
        } else {
            throw new ForbiddenError("Rol no autorizado para modificar horarios");
        }
    }

    async getTeacherSchedule(teacherProfileId: string, authUser: AuthUser): Promise<TeacherSchedule[]> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    cs.id,
                    c.course_id,
                    co.name AS course_name,
                    cs.class_id,
                    s.name AS subject_name,
                    a.name AS area_name,
                    cs.day_of_week,
                    cs.start_time,
                    cs.end_time,
                    cs.room
                FROM class_schedule cs
                JOIN class c ON cs.class_id = c.id
                JOIN subject s ON c.subject_id = s.id
                JOIN area a ON s.area_id = a.id
                JOIN course co ON c.course_id = co.id
                JOIN teacher t ON c.teacher_id = t.id
                JOIN profile p ON t.profile_id = p.id
                WHERE p.id = $1 AND p.school_id = $2
                ORDER BY cs.day_of_week ASC, cs.start_time ASC
            `, [teacherProfileId, userSchoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async checkCourseOverlap(payload: CheckOverlapPayload, authUser: AuthUser): Promise<boolean> {
        const { classId, day, startTime, endTime, excludeScheduleId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const params: any[] = [classId, day, startTime, endTime, userSchoolId];
            let query = `
                SELECT 1
                FROM class_schedule cs
                JOIN class c ON cs.class_id = c.id
                JOIN course co ON c.course_id = co.id
                WHERE c.course_id = (SELECT course_id FROM class WHERE id = $1)
                  AND cs.day_of_week = $2
                  AND cs.start_time < $4
                  AND cs.end_time > $3
                  AND co.school_id = $5
            `;

            if (excludeScheduleId) {
                params.push(excludeScheduleId);
                query += ` AND cs.id != $6`;
            }

            const result = await client.query(query, params);
            return result.rowCount !== null && result.rowCount > 0;
        } finally {
            client.release();
        }
    }

    async checkTeacherOverlap(payload: CheckOverlapPayload, authUser: AuthUser): Promise<boolean> {
        const { classId, day, startTime, endTime, excludeScheduleId } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const params: any[] = [classId, day, startTime, endTime, userSchoolId];
            let query = `
                SELECT 1
                FROM class_schedule cs
                JOIN class c ON cs.class_id = c.id
                JOIN course co ON c.course_id = co.id
                WHERE c.teacher_id = (SELECT teacher_id FROM class WHERE id = $1)
                  AND cs.day_of_week = $2
                  AND cs.start_time < $4
                  AND cs.end_time > $3
                  AND co.school_id = $5
            `;

            if (excludeScheduleId) {
                params.push(excludeScheduleId);
                query += ` AND cs.id != $6`;
            }

            const result = await client.query(query, params);
            return result.rowCount !== null && result.rowCount > 0;
        } finally {
            client.release();
        }
    }

    async createClassSchedule(classId: string, schedule: UpsertSchedule, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await this.verifyClassAccess(client, classId, authUser);

            await client.query(`
                INSERT INTO class_schedule (day_of_week, start_time, end_time, room, class_id)
                VALUES ($1, $2, $3, $4, $5)
            `, [schedule.day, schedule.startTime, schedule.endTime, schedule.room, classId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_CLASS_SCHEDULE",
                schoolId: userSchoolId,
                metadata: { classId, room: schedule.room }
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateClassSchedule(scheduleId: string, schedule: UpdateSchedule, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const scheduleLookup = await client.query(
                'SELECT class_id FROM class_schedule WHERE id = $1',
                [scheduleId]
            );

            if (scheduleLookup.rowCount === 0) throw new NotFoundError("El horario no existe");
            const actualClassId = scheduleLookup.rows[0].class_id;
            await this.verifyClassAccess(client, actualClassId, authUser);

            await client.query(`
                UPDATE class_schedule
                SET day_of_week = $1, room = $2, start_time = $3, end_time = $4
                WHERE id = $5
            `, [schedule.day, schedule.room, schedule.startTime, schedule.endTime, scheduleId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_CLASS_SCHEDULE",
                schoolId: userSchoolId,
                metadata: { classScheduleId: scheduleId, room: schedule.room }
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteClassSchedule(scheduleId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const classQuery = await client.query(
                'SELECT class_id FROM class_schedule WHERE id = $1',
                [scheduleId]
            );
            if (classQuery.rowCount === 0) {
                throw new NotFoundError("El horario a eliminar no existe");
            }

            await this.verifyClassAccess(client, classQuery.rows[0].class_id, authUser);

            await client.query('DELETE FROM class_schedule WHERE id = $1', [scheduleId]);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_CLASS_SCHEDULE",
                schoolId: userSchoolId,
                metadata: { classScheduleId: scheduleId }
            });

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}