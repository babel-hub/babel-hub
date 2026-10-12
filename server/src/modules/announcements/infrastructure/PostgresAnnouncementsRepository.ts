import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    CreateAnnouncementPayload, GetFeedPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { ForbiddenError, NotFoundError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";
import type { PoolClient } from "pg";

const TARGET_CONFIG: Record<string, { column: string; cast: string }> = {
    ROLE:    { column: "role",       cast: "text[]" },
    COURSE:  { column: "course_id",  cast: "uuid[]" },
    PROFILE: { column: "profile_id", cast: "uuid[]" },
};

export class PostgresAnnouncementsRepository implements IAnnouncementsRepository {

    async getFeed(payload: GetFeedPayload, authUser: AuthUser): Promise<Announcement[]> {
        const { courseId } = payload;
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            const query = `
                SELECT
                    a.id,
                    CONCAT(p.first_name, ' ', p.first_last_name) AS author,
                    a.title,
                    a.type,
                    a.description,
                    a.target_type,
                    a.created_at,
                    a.caption
                FROM announcement a
                         JOIN profile p ON a.author_id = p.id
                WHERE a.school_id = $1
                  AND (
                    a.author_id = $2
                        OR a.target_type = 'ALL'
                        OR EXISTS (
                        SELECT 1 FROM announcement_target at
                        WHERE at.announcement_id = a.id
                            AND (
                                  at.role = $3
                                      OR at.profile_id = $2
                                      OR at.course_id = $4
                                  )
                    )
                    )
                ORDER BY a.created_at DESC
                    LIMIT 50;
            `;

            const result = await client.query(query, [userSchoolId, userId, userRole, courseId ?? null]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT 1 FROM profile WHERE id = $1 AND school_id = $2
            `, [userId, userSchoolId]);

            if (check.rowCount === 0) throw new ForbiddenError("No puedes hacer esta acción");

            const result = await client.query(`
                INSERT INTO announcement (title, description, type, target_type, school_id, author_id, caption)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id;
            `, [
                payload.title,
                payload.description,
                payload.type,
                payload.target_type,
                userSchoolId,
                userId,
                payload.caption
            ]);

            const newId = result.rows[0].id;
            await this.insertTargets(client, newId, payload.target_type, payload.target_value);

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_ANNOUNCEMENT",
                schoolId: userSchoolId,
                metadata: {
                    id: newId,
                    title: payload.title,
                    targetType: payload.target_type,
                    targetValue: payload.target_value
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT 1 FROM announcement WHERE id = $1 AND school_id = $2
            `, [payload.announcementId, userSchoolId]);

            if (check.rowCount === 0) {
                throw new NotFoundError("No se encontró el comunicado para actualizar");
            }

            await client.query(`
                UPDATE announcement
                SET title = $1, description = $2, type = $3, caption = $4, target_type = $5
                WHERE id = $6
            `, [
                payload.title,
                payload.description,
                payload.type,
                payload.caption,
                payload.target_type,
                payload.announcementId
            ]);

            await client.query(`
                DELETE FROM announcement_target WHERE announcement_id = $1
            `, [payload.announcementId]);

            await this.insertTargets(
                client,
                payload.announcementId,
                payload.target_type,
                payload.target_value
            );

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_ANNOUNCEMENT",
                schoolId: userSchoolId,
                metadata: {
                    id: payload.announcementId,
                    title: payload.title,
                    targetType: payload.target_type,
                    targetValue: payload.target_value
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void> {
        const { userId, userRole, userSchoolId } = authUser;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM announcement
                WHERE id = $1 AND school_id = $2
                    RETURNING id, title;
            `, [announcementId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("No se encontró el comunicado para eliminar");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_ANNOUNCEMENT",
                schoolId: userSchoolId,
                metadata: {
                    id: result.rows[0].id,
                    title: result.rows[0].title
                }
            });

            await client.query('COMMIT');
        } catch (error: any) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private async insertTargets(
        client: PoolClient,
        announcementId: string,
        targetType: string,
        targetValue: string[] | null,
    ): Promise<void> {
        if (targetType === "ALL" || !targetValue?.length) return;

        const config = TARGET_CONFIG[targetType];
        if (!config) return;

        await client.query(
            `INSERT INTO announcement_target (announcement_id, ${config.column})
             SELECT $1, unnest($2::${config.cast})
                 ON CONFLICT DO NOTHING`,
            [announcementId, targetValue],
        );
    }
}