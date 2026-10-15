import type { IScalesRepository } from "../domain/IScalesRepository.js";
import type { Scale } from "../domain/Scales.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { NotFoundError } from "../../errors/domain/CustomErrors.js";

export class PostgresScaleRepository implements IScalesRepository {

    async getScales(authUser: AuthUser): Promise<Scale[]> {
        const { userSchoolId } = authUser;

        // Scales by school id in a future version
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    id,
                    name,
                    min_value,
                    max_value,
                    passing_value
                FROM scale
                ORDER BY name ASC;
            `);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getClassScale(classId: string, authUser: AuthUser): Promise<Scale> {
        const { userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const scale = await client.query(`
                SELECT
                    sc.id,
                    sc.name,
                    sc.min_value::float AS min_value,
                    sc.max_value::float AS max_value,
                    sc.passing_value::float AS passing_value
                FROM class c
                    JOIN subject s ON c.subject_id = s.id
                    JOIN grading_template g ON s.grading_template_id = g.id
                    JOIN scale sc ON g.scale_id = sc.id
                WHERE c.id = $1 AND g.school_id = $2
            `, [classId, userSchoolId]);

            if (scale.rowCount === 0) {
                throw new NotFoundError("No se encontraron escalas para esta clase");
            }

            return scale.rows[0];
        } finally {
            client.release();
        }
    }
}