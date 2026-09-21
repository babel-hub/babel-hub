import type { IClassScheduleRepository } from "../domain/IClassScheduleRepository.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { UnauthorizedError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";
import type { TeacherSchedule } from "../domain/ClassSchedule.types.js";

export class PostgresClassScheduleRepository implements IClassScheduleRepository {
    async getTeacherSchedule(teacherProfileId: string): Promise<TeacherSchedule[]> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
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
                WHERE t.profile_id = $1
                ORDER BY cs.day_of_week ASC, cs.start_time ASC;
            `;

            const result = await client.query(query, [teacherProfileId]);
            return result.rows;
        } finally {
            client.release();
        }
    }


    async checkCourseOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 1
                FROM class_schedule cs
                JOIN class c ON cs.class_id = c.id
                WHERE c.course_id = (SELECT course_id FROM class WHERE id = $1)
                  AND cs.day_of_week = $2
                  AND cs.start_time < $4
                  AND cs.end_time > $3
            `;
            const params: any[] = [classId, day, startTime, endTime];

            if (excludeScheduleId) {
                params.push(excludeScheduleId);
                query += ` AND cs.id != $5`;
            }

            const result = await client.query(query, params);
            return result.rowCount !== null && result.rowCount > 0;
        } finally {
            client.release();
        }
    }

    async checkTeacherOverlap(classId: string, day: number, startTime: string, endTime: string, excludeScheduleId?: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 1
                FROM class_schedule cs
                JOIN class c ON cs.class_id = c.id
                WHERE c.teacher_id = (SELECT teacher_id FROM class WHERE id = $1)
                  AND cs.day_of_week = $2
                  AND cs.start_time < $4
                  AND cs.end_time > $3
            `;
            const params: any[] = [classId, day, startTime, endTime];

            if (excludeScheduleId) {
                params.push(excludeScheduleId);
                query += ` AND cs.id != $5`;
            }

            const result = await client.query(query, params);
            return result.rowCount !== null && result.rowCount > 0;
        } finally {
            client.release();
        }
    }

    async createClassSchedule(classId: string, day: number, startTime: string, endTime: string, room: string, authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (authUser.userRole === 'teacher') {
                const check = await client.query(`
                    SELECT 1 FROM class c
                    JOIN teacher t ON c.teacher_id = t.id
                    JOIN profile p ON t.profile_id = p.id
                    WHERE p.id = $1 AND p.school_id = $2 AND c.id = $3
                `, [authUser.userId, authUser.userSchoolId, classId]);

                if (check.rowCount === 0) throw new UnauthorizedError("No tienes permisos para asignar horarios a esta clase");
            } else if (authUser.userRole === 'principal') {
                const checkSchool = await client.query(`
                    SELECT 1 FROM class c
                    JOIN course co ON c.course_id = co.id
                    WHERE c.id = $1 AND co.school_id = $2
                `, [classId, authUser.userSchoolId]);

                if (checkSchool.rowCount === 0) throw new UnauthorizedError("La clase no pertenece a tu institución");
            }

            await client.query(`
                INSERT INTO class_schedule (day_of_week, start_time, end_time, room, class_id)
                VALUES ($1, $2, $3, $4, $5);
            `, [day, startTime, endTime, room, classId]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "CREATE_CLASS_SCHEDULE",
                schoolId: authUser.userSchoolId,
                metadata: {
                    classId,
                    room,
                }
            })

            await client.query('COMMIT');
            return;
        } catch (error : any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}