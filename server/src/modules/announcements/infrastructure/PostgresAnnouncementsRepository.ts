import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { NotFoundError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";

export class PostgresAnnouncementsRepository implements IAnnouncementsRepository {
    async getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        courseId?: string
    ): Promise<Announcement[]> {
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
                      a.target_type = 'ALL'
                      OR EXISTS (
                          SELECT 1 FROM announcement_target at
                          WHERE at.announcement_id = a.id
                            AND (
                                at.role = $2
                                OR at.profile_id = $3
                                OR at.course_id = $4
                            )
                      )
                  )
                ORDER BY a.created_at DESC;
            `;

            const result = await client.query(query, [schoolId, role, profileId, courseId || null]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Hardcoded to 'ALL' for this V1. Later, if you add targets, you'll insert into announcement_target here.
            const result = await client.query(`
                INSERT INTO announcement (title, description, type, target_type, school_id, author_id, caption)
                VALUES ($1, $2, $3, 'ALL', $4, $5, $6)
                RETURNING id;
            `, [payload.title, payload.description, payload.type, authUser.userSchoolId, authUser.userId, payload.caption]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "CREATE_ANNOUNCEMENT",
                schoolId: authUser.userSchoolId,
                metadata: {
                    id: result.rows[0].id,
                    title: payload.title,
                    type: payload.type
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT 1
                FROM announcement an
                WHERE an.id = $1 AND an.school_id = $2
            `, [payload.announcementId, authUser.userSchoolId]);

            if (check.rowCount === 0) throw new NotFoundError("No se encontró el comunicado para actualizar");

            // Fixed typo: tile -> title.
            // Removed target_type update for now since we are focusing on the 'ALL' broadcast.
            await client.query(`
                UPDATE announcement
                SET title = $1, description = $2, type = $3, caption = $5
                WHERE id = $4
            `, [payload.title, payload.description, payload.type, payload.announcementId, payload.caption]);

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "UPDATE_ANNOUNCEMENT",
                schoolId: authUser.userSchoolId,
                metadata: {
                    id: payload.announcementId,
                    title: payload.title
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM announcement
                WHERE id = $1 AND school_id = $2
                RETURNING id, title;
            `, [announcementId, authUser.userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError("No se encontró el comunicado para eliminar");

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "DELETE_ANNOUNCEMENT",
                schoolId: authUser.userSchoolId,
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
}