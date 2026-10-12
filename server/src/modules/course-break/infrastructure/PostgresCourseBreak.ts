import type {
    ICourseBreakRepository
} from "../domain/ICourseBreakRepository.js";
import type { CourseBreakByDate, GetCourseBreaksByDatePayload } from "../domain/CourseBreak.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresCourseBreakRepository implements ICourseBreakRepository {

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
}