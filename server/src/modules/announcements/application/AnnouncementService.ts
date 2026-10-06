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

    async getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        authUser: AuthUser,
        courseId?: string
    ): Promise<Announcement[]> {
        if (!authUser.userId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!schoolId || !profileId || !role) {
            throw new ValidationError("Faltan identificadores del usuario para cargar el feed");
        }

        return await this.announcementRepository.getFeed(schoolId, profileId, role, authUser, courseId);
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!payload.title || !payload.description || !payload.type) throw new ValidationError("Faltan campos obligatorios");

        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type)) {
            throw new ValidationError("Tipo de comunicado inválido");
        }

        const normalized: CreateAnnouncementPayload = {
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            caption: nullifyEmpty(payload.caption),
            target_type: payload.target_type,
            target_value: nullifyEmpty(payload.target_value)
        }

        return await this.announcementRepository.createAnnouncement(normalized, authUser);
    }

    async updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!payload.title || !payload.description || !payload.type || !payload.announcementId) throw new ValidationError("Faltan campos obligatorios");

        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type)) throw new ValidationError("Tipo de comunicado inválido");
        if (!VALID_TARGET_TYPES.includes(payload.target_type)) throw new ValidationError("Tipo de receptor inválido");

        const normalized: UpdateAnnouncementPayload = {
            announcementId: payload.announcementId,
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            target_type: payload.target_type,
            caption: nullifyEmpty(payload.caption),
            target_value: nullifyEmpty(payload.target_value)
        }

        return await this.announcementRepository.updateAnnouncement(normalized, authUser);
    }

    async deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!announcementId) throw new ValidationError("Falta el id del comunicado");

        return await this.announcementRepository.deleteAnnouncement(announcementId, authUser);
    }
}