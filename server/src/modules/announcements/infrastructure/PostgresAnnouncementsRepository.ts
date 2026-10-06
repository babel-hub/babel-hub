import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";
import { ForbiddenError, NotFoundError } from "../../errors/domain/CustomErrors.js";
import { createAuditLog } from "../../../services/audit.service.js";

export class PostgresAnnouncementsRepository implements IAnnouncementsRepository {
    async getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        authUser: AuthUser,
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
                    a.author_id = $2
                        OR a.target_type = 'ALL'
                        OR EXISTS (
                        SELECT 1 FROM announcement_target at
                        WHERE at.announcement_id = a.id
                            AND (
                                at.role = $3
                                OR at.profile_id = $4
                                OR at.course_id = $5
                            )
                    )
                )
                ORDER BY a.created_at DESC;
            `;

            const result = await client.query(query, [schoolId, authUser.userId, role, profileId, courseId || null]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT 1
                FROM profile
                WHERE id = $1 AND school_id = $2
            `, [authUser.userId, authUser.userSchoolId]);

            if (check.rowCount === 0) throw new ForbiddenError("No puedes hacer esta acción");

            const result = await client.query(`
                INSERT INTO announcement (title, description, type, target_type, school_id, author_id, caption)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id;
            `, [payload.title, payload.description, payload.type, payload.target_type, authUser.userSchoolId, authUser.userId, payload.caption]);

            const newAnnouncementId = result.rows[0].id;

            if (payload.target_type !== "ALL") {
                let role = null;
                let courseId = null;
                let profileId = null;

                if (payload.target_type === "ROLE") role = payload.target_value;
                else if (payload.target_type === "COURSE") courseId = payload.target_value;
                else if (payload.target_type === "PROFILE") profileId = payload.target_value;

                await client.query(`
                    INSERT INTO announcement_target (announcement_id, role, course_id, profile_id)
                    VALUES ($1, $2, $3, $4)
                `, [newAnnouncementId, role, courseId, profileId]);
            }

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "CREATE_ANNOUNCEMENT",
                schoolId: authUser.userSchoolId,
                metadata: {
                    id: newAnnouncementId,
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(`
                SELECT 1
                FROM announcement an
                WHERE an.id = $1 AND an.school_id = $2
            `, [payload.announcementId, authUser.userSchoolId]);

            if (check.rowCount === 0) throw new NotFoundError("No se encontró el comunicado para actualizar");

            await client.query(`
                UPDATE announcement
                SET title = $1, description = $2, type = $3, caption = $4, target_type = $5
                WHERE id = $6
            `, [payload.title, payload.description, payload.type, payload.caption, payload.target_type, payload.announcementId]);

            await client.query(`
                DELETE FROM announcement_target 
                WHERE announcement_id = $1
            `, [payload.announcementId]);

            if (payload.target_type !== "ALL") {
                let role = null;
                let courseId = null;
                let profileId = null;

                if (payload.target_type === "ROLE") role = payload.target_value;
                else if (payload.target_type === "COURSE") courseId = payload.target_value;
                else if (payload.target_type === "PROFILE") profileId = payload.target_value;

                await client.query(`
                    INSERT INTO announcement_target (announcement_id, role, course_id, profile_id)
                    VALUES ($1, $2, $3, $4)
                `, [payload.announcementId, role, courseId, profileId]);
            }

            await createAuditLog(client, {
                actorUserId: authUser.userId,
                actorRole: authUser.userRole,
                action: "UPDATE_ANNOUNCEMENT",
                schoolId: authUser.userSchoolId,
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