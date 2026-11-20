import type {
    ICourseBreakRepository
} from "../domain/ICourseBreakRepository.js";
import type {
    CourseBreak,
    CourseBreakByDate,
    CreateBreakGroupPayload,
    GetCourseBreaksByDatePayload, UpdateBreakGroupPayload
} from "../domain/CourseBreak.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import {NotFoundError, ValidationError} from "../../errors/domain/CustomErrors.js";

export class PostgresCourseBreakRepository implements ICourseBreakRepository {
    private async classBreakOverLap(courseId: string, days: number[], startTime: string, endTime: string): Promise<void> {
        const client = await pool.connect();

        try {
            const check = await client.query(`
                SELECT 1 FROM class_schedule cs
                    JOIN class cl ON cl.id = cs.class_id
                WHERE cl.course_id = $1
                  AND cs.day_of_week = ANY($2::int[])
                  AND cs.start_time < $4::time
                  AND cs.end_time > $3::time
            `, [courseId, days, startTime, endTime]);

            if (check.rowCount === 0) throw new ValidationError("El descanso cruza con alguna clase del curso");
        } finally {
            client.release();
        }
    }

    async getCourseBreaksByDate(
        payload: GetCourseBreaksByDatePayload,
        authUser: AuthUser
    ): Promise<CourseBreakByDate[]> {
        const { courseId, date } = payload;
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const courseCheck = await client.query(`
                SELECT 1 FROM course WHERE id = $1 AND school_id = $2
            `, [courseId, userSchoolId]);

            if (courseCheck.rowCount === 0) {
                throw new NotFoundError("El curso no existe o no pertenece a este colegio.");
            }

            const result = await client.query(`
                SELECT id, name, start_time, end_time
                FROM course_break
                WHERE course_id = $1
                  AND day_of_week = EXTRACT(ISODOW FROM $2::DATE)
                ORDER BY start_time ASC
            `, [courseId, date]);

            return result.rows;
        } finally {
            client.release();
        }
    }


    async getCourseBreaks(courseId: string, authUser: AuthUser): Promise<CourseBreak[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT cb.id, cb.course_id, cb.name, cb.day_of_week, cb.start_time, cb.end_time
                FROM course_break cb
                    JOIN course co ON co.id = cb.course_id
                WHERE cb.course_id = $1 AND co.school_id = $2
                ORDER BY cb.name ASC, cb.start_time ASC, cb.day_of_week ASC
            `, [courseId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createBreaks(
        courseId: string,
        payload: CreateBreakGroupPayload,
        authUser: AuthUser
    ): Promise<void> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const courseCheck = await client.query(
                `SELECT 1 FROM course WHERE id = $1 AND school_id = $2`,
                [courseId, userSchoolId]
            );
            if (courseCheck.rowCount === 0) {
                throw new NotFoundError("El curso no existe en este colegio");
            }

            await this.classBreakOverLap(courseId, payload.days, payload.start_time, payload.end_time);

            await client.query(`
                INSERT INTO course_break (course_id, name, day_of_week, start_time, end_time)
                SELECT $1, $2, unnest($3::int[]), $4::time, $5::time
            `, [courseId, payload.name, payload.days, payload.start_time, payload.end_time]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async replaceBreakGroup(
        courseId: string,
        payload: UpdateBreakGroupPayload,
        authUser: AuthUser
    ): Promise<void> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT COUNT(*)::int AS cnt FROM course_break cb
                    JOIN course co ON co.id = cb.course_id
                WHERE cb.id = ANY($1::uuid[]) AND cb.course_id = $2 AND co.school_id = $3
            `, [payload.ids, courseId, userSchoolId]);
            if (check.rows[0].cnt !== payload.ids.length) {
                throw new NotFoundError("Uno o más descansos no existen en este curso");
            }

            await client.query(
                `DELETE FROM course_break WHERE id = ANY($1::uuid[])`,
                [payload.ids]
            );

            await client.query(`
                INSERT INTO course_break (course_id, name, day_of_week, start_time, end_time)
                SELECT $1, $2, unnest($3::int[]), $4::time, $5::time
            `, [courseId, payload.name, payload.days, payload.start_time, payload.end_time]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteBreaks(courseId: string, ids: string[], authUser: AuthUser): Promise<void> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
            DELETE FROM course_break cb
            USING course co
            WHERE cb.course_id = co.id
              AND cb.id = ANY($1::uuid[])
              AND cb.course_id = $2
              AND co.school_id = $3
            RETURNING cb.id
        `, [ids, courseId, userSchoolId]);

            if (result.rowCount !== ids.length) {
                throw new NotFoundError("Uno o más descansos no existen en este curso");
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}