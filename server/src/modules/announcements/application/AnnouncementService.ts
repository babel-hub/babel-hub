import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeText } from "../../shared/domain/normalize.js";

const VALID_ANNOUNCEMENT_TYPES = [ 'GENERAL', 'EVENT', 'EMERGENCY', 'DEADLINE', 'POLL' ];
export class AnnouncementService {
    constructor(private readonly announcementRepository: IAnnouncementsRepository) {}

    async getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        courseId?: string
    ): Promise<Announcement[]> {
        if (!schoolId || !profileId || !role) {
            throw new ValidationError("Faltan identificadores del usuario para cargar el feed");
        }

        return await this.announcementRepository.getFeed(schoolId, profileId, role, courseId);
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!payload.title || !payload.description || !payload.type) throw new ValidationError("Faltan campos obligatorios");

        // Validación estricta del tipo
        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type)) {
            throw new ValidationError("Tipo de comunicado inválido");
        }

        const normalized: CreateAnnouncementPayload = {
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            // Pasamos el tipo tal cual, ya que validamos que es seguro y exacto
            type: payload.type
        }

        return await this.announcementRepository.createAnnouncement(normalized, authUser);
    }

    async updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!payload.title || !payload.description || !payload.type || !payload.announcementId) throw new ValidationError("Faltan campos obligatorios");

        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type)) {
            throw new ValidationError("Tipo de comunicado inválido");
        }

        const normalized: UpdateAnnouncementPayload = {
            announcementId: payload.announcementId,
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type
        }

        return await this.announcementRepository.updateAnnouncement(normalized, authUser);
    }

    async deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Credenciales del usuario inválidas");
        if (!announcementId) throw new ValidationError("Falta el id del comunicado");

        return await this.announcementRepository.deleteAnnouncement(announcementId, authUser);
    }
}