import type { IAreaRepository } from "../domain/IAreaRepository.js";
import type { Area, AreaDetails } from "../domain/Areas.types.js"
import { createAuditLog } from "../../../services/audit.service.js";
import { pool } from "../../../db/index.js";
import { NotFoundError, ConflictError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export class PostgresAreaRepository implements IAreaRepository  {
    async getAreas(schoolId: string): Promise<Area[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM area
                WHERE school_id = $1
                ORDER BY name ASC
            `, [schoolId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getAreaDetails(id: string, schoolId: string): Promise<AreaDetails | null> {
        const client = await pool.connect();
        try {
            const area = await client.query(`
                SELECT
                    id,
                    name,
                    school_id
                FROM area
                WHERE id = $1 AND school_id = $2;
            `, [id, schoolId]);

            if (area.rowCount === 0) return null;

            const subjects = await client.query(`
                SELECT
                    s.id,
                    s.name,
                    g.id AS grading_template_id,
                    g.name AS grading_template_name
                FROM subject s
                         JOIN grading_template g ON s.grading_template_id = g.id
                WHERE s.area_id = $1;
            `, [id]);

            return {
                area: area.rows[0],
                subjects: subjects.rows
            };
        } finally {
            client.release();
        }
    }

    async insertArea(name: string, authUser: AuthUser): Promise<Area> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query(`BEGIN`);

            const result = await client.query(`
                INSERT INTO area (school_id, name)
                VALUES ($1, $2)
                    RETURNING id, name
            `, [userSchoolId, name]);

            const area = result.rows[0];

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_AREA",
                schoolId: userSchoolId,
                metadata: { areaId: area.id, name: area.name }
            });

            await client.query(`COMMIT`);

            return area;
        } catch (error) {
            await client.query(`ROLLBACK`);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateArea(id: string, newName: string, authUser: AuthUser): Promise<Area> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE area
                SET name = $1
                WHERE id = $2 AND school_id = $3
                    RETURNING id, name
            `, [newName, id, userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError(`No fue posible actualizar el área, o no pertenece a este colegio.`);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_AREA",
                schoolId: userSchoolId,
                metadata: { areaID: id, newName: newName }
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

    async deleteArea(id: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM area
                WHERE id = $1 AND school_id = $2
                    RETURNING id, name
            `, [id, userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError(`No fue posible eliminar el área, o no pertenece a este colegio.`);

            const area = result.rows[0];

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_AREA",
                schoolId: userSchoolId,
                metadata: { areaId: id, deletedName: area.name }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23503') throw new ConflictError("No se puede eliminar el área porque tiene asignaturas vinculadas.");

            throw error;
        } finally {
            client.release();
        }
    }
}