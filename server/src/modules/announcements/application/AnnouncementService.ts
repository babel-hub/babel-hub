import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import {normalizeText, nullifyEmpty} from "../../shared/domain/normalize.js";

const VALID_ANNOUNCEMENT_TYPES = [ 'GENERAL', 'EVENT', 'EMERGENCY', 'DEADLINE', 'POLL' ];
const VALID_TARGET_TYPES = [ 'ALL', 'PROFILE', 'ROLE', 'COURSE' ];
export class AnnouncementService {
    constructor(private readonly announcementRepository: IAnnouncementsRepository) {}

    private normalizeCreate(payload: CreateAnnouncementPayload): CreateAnnouncementPayload {
        return {
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            caption: nullifyEmpty(payload.caption) as string | null,
            target_type: payload.target_type,
            target_value: nullifyEmpty(payload.target_value) as string[] | null,
        };
    }

    private normalizeUpdate(payload: UpdateAnnouncementPayload): UpdateAnnouncementPayload {
        return {
            announcementId: payload.announcementId,
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            target_type: payload.target_type,
            caption: nullifyEmpty(payload.caption) as string | null,
            target_value: nullifyEmpty(payload.target_value) as string[] | null,
        };
    }

    private requireAuth(authUser: AuthUser): Required<AuthUser> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales del usuario inválidas");
        }
        return authUser as Required<AuthUser>;
    }

    private validate(payload: {
        title?: string;
        description?: string;
        type?: string;
        target_type?: string;
        target_value?: string[] | null;
    }): void {
        if (!payload.title || !payload.description || !payload.type) {
            throw new ValidationError("Faltan campos obligatorios");
        }
        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type as any)) {
            throw new ValidationError("Tipo de comunicado inválido");
        }
        if (payload.target_type && !VALID_TARGET_TYPES.includes(payload.target_type as any)) {
            throw new ValidationError("Tipo de receptor inválido");
        }
        if (
            payload.target_type !== "ALL" &&
            (!payload.target_value || payload.target_value.length === 0)
        ) {
            throw new ValidationError("Debes seleccionar al menos un destinatario específico.");
        }
    }

    async getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        authUser: AuthUser,
        courseId?: string
    ): Promise<Announcement[]> {
        const ctx = this.requireAuth(authUser);

        if (!schoolId || !profileId || !role) {
            throw new ValidationError("Faltan identificadores del usuario para cargar el feed");
        }

        return this.announcementRepository.getFeed(schoolId, profileId, role, ctx, courseId);
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const ctx = this.requireAuth(authUser);
        this.validate(payload);

        const normalized = this.normalizeCreate(payload);
        await this.announcementRepository.createAnnouncement(normalized, ctx);
    }

    async updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const ctx = this.requireAuth(authUser);
        if (!payload.announcementId) throw new ValidationError("Faltan campos obligatorios");
        this.validate(payload);

        const normalized = this.normalizeUpdate(payload);
        return await this.announcementRepository.updateAnnouncement(normalized, ctx);
    }

    async deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void> {
        const ctx = this.requireAuth(authUser);
        if (!announcementId) throw new ValidationError("Falta el id del comunicado");

        return await this.announcementRepository.deleteAnnouncement(announcementId, ctx);
    }
}