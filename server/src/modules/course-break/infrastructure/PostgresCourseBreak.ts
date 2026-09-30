import type { ICourseBreakRepository } from "../domain/ICourseBreakRepository.js";
import type { CourseBreakByDate } from "../domain/CourseBreak.types.js";
import { pool } from "../../../db/index.js";
import { NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresCourseBreakRepository implements ICourseBreakRepository {
    async getCourseBreaksByDate(courseId: string, date: string, schoolId: string): Promise<CourseBreakByDate[]> {
        const client = await pool.connect();
        try {
            const courseCheck = await client.query(`
                SELECT 1
                FROM course c
                WHERE c.id = $1 AND c.school_id = $2;
            `, [courseId, schoolId]);

            if (courseCheck.rowCount === 0) {
                throw new NotFoundError("El curso no existe o no pertenece a este colegio.");
            }

            const breaksQuery = `
                SELECT id, name, start_time, end_time
                FROM course_break
                WHERE course_id = $1
                AND day_of_week = EXTRACT(ISODOW FROM $2::DATE)
                ORDER BY start_time ASC;
            `;

            const result = await client.query(breaksQuery, [courseId, date]);

            return result.rows;
        } finally {
            client.release();
        }
    }
}