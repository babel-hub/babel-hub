import type { IAnnouncementsRepository } from "../domain/IAnnouncementsRepository.js";
import type {
    Announcement,
    GetFeedPayload,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload,
    AnnouncementTargetType, AnnouncementType
} from "../domain/Announcements.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { normalizeText, nullifyEmpty, nullifyEmptyArray } from "../../shared/domain/normalize.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

const VALID_ANNOUNCEMENT_TYPES: readonly AnnouncementType[] = ['GENERAL', 'EVENT', 'EMERGENCY', 'DEADLINE', 'POLL'];
const VALID_TARGET_TYPES: readonly AnnouncementTargetType[] = ['ALL', 'PROFILE', 'ROLE', 'COURSE'];

export class AnnouncementService {
    constructor(private readonly announcementRepository: IAnnouncementsRepository) {}

    private normalizeCreate(payload: CreateAnnouncementPayload): CreateAnnouncementPayload {
        return {
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            caption: nullifyEmpty(payload.caption),
            target_type: payload.target_type,
            target_value: nullifyEmptyArray(payload.target_value),
        };
    }

    private normalizeUpdate(payload: UpdateAnnouncementPayload): UpdateAnnouncementPayload {
        return {
            announcementId: payload.announcementId,
            title: normalizeText(payload.title),
            description: normalizeText(payload.description),
            type: payload.type,
            target_type: payload.target_type,
            caption: nullifyEmpty(payload.caption),
            target_value: nullifyEmptyArray(payload.target_value),
        };
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
        if (!VALID_ANNOUNCEMENT_TYPES.includes(payload.type as AnnouncementType)) {
            throw new ValidationError("Tipo de comunicado inválido");
        }
        if (!payload.target_type || !VALID_TARGET_TYPES.includes(payload.target_type as AnnouncementTargetType)) {
            throw new ValidationError("Tipo de receptor inválido");
        }
        if (payload.target_type !== "ALL" && (!payload.target_value || payload.target_value.length === 0)) {
            throw new ValidationError("Debes seleccionar al menos un destinatario específico.");
        }
    }

    async getFeed(courseId: string | undefined, authUser: AuthUser): Promise<Announcement[]> {
        const auth = requireAuth(authUser);
        const payload: GetFeedPayload = { courseId };
        return this.announcementRepository.getFeed(payload, auth);
    }

    async createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        this.validate(payload);

        const normalized = this.normalizeCreate(payload);
        await this.announcementRepository.createAnnouncement(normalized, auth);
    }

    async updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.announcementId) throw new ValidationError("Falta el id del comunicado");
        this.validate(payload);

        const normalized = this.normalizeUpdate(payload);
        await this.announcementRepository.updateAnnouncement(normalized, auth);
    }

    async deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!announcementId) throw new ValidationError("Falta el id del comunicado");

        await this.announcementRepository.deleteAnnouncement(announcementId, auth);
    }
}