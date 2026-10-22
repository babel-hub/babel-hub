import type { ISubjectsRepository } from "../domain/ISubjectsRepository.js";
import type {
    AvailableSubjects,
    CreateSubject,
    CreateSubjectPayload, GetAvailableSubjectsPayload,
    GetSubjectsByAreaPayload,
    SubjectDetails, UpdateSubjectPayload
} from "../domain/Subjects.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import {ConflictError, NotFoundError, ValidationError} from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import type { IAssignmentRepository } from "../../assignments/domain/IAssignmentRepository.js";

export class SubjectServices {
    constructor(
        private readonly subjectRepository: ISubjectsRepository,
        private assignmentRepository: IAssignmentRepository
    ) {}

    private validate(payload: CreateSubjectPayload): void {
        if (!payload.subjectName?.trim() || !payload.subjectAreaId?.trim() || !payload.gradingTemplateId?.trim()) {
            throw new ValidationError("Faltan campos obligatorios");
        }
    }

    async getSubjectsByArea(subjectAreaId: string, authUser: AuthUser): Promise<SubjectDetails[]> {
        const auth = requireAuth(authUser);
        if (!subjectAreaId) throw new ValidationError("Faltan campos obligatorios");

        const payload: GetSubjectsByAreaPayload = { subjectAreaId };
        return this.subjectRepository.getSubjectsByArea(payload, auth);
    }

    async getAvailableSubjects(courseId: string, authUser: AuthUser): Promise<AvailableSubjects[]> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");

        const payload: GetAvailableSubjectsPayload = { courseId };
        return this.subjectRepository.getAvailableSubjects(payload, auth);
    }

    async createSubject(payload: CreateSubjectPayload, authUser: AuthUser): Promise<CreateSubject> {
        const auth = requireAuth(authUser);
        this.validate(payload);
        return this.subjectRepository.createSubject(payload, auth);
    }

    async updateSubject(payload: UpdateSubjectPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.subjectId) throw new ValidationError("El ID de la asignatura es obligatorio");
        this.validate(payload);

        const currentSubject = await this.subjectRepository.getSubjectById(payload.subjectId, auth);
        if (!currentSubject) {
            throw new NotFoundError("La asignatura no existe o no pertenece a este colegio.");
        }

        if (currentSubject.grading_template_id !== payload.gradingTemplateId) {
            const hasAssignments = await this.assignmentRepository.hasAssignmentsForSubject(payload.subjectId);
            if (hasAssignments) {
                throw new ConflictError("No se puede cambiar la plantilla de evaluación porque hay asignaciones creadas. Elimine las asignaciones primero.");
            }
        }

        await this.subjectRepository.updateSubject(payload, auth);
    }
    async deleteSubject(subjectId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!subjectId) throw new ValidationError("El ID de la asignatura es obligatorio");
        await this.subjectRepository.deleteSubject(subjectId, auth);
    }
}