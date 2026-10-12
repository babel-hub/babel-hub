import type { ITeacherRepository, GetTeachersPayload } from "../domain/ITeacherRepository.js";
import type { CreateTeacher, TeacherDetails, Teachers } from "../domain/Teacher.types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser, TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";
import { normalizeOptionalText, normalizeText, nullifyEmpty } from "../../shared/domain/normalize.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

import type { IAssignmentRepository } from "../../assignments/domain/IAssignmentRepository.js";
import type { IClassScheduleRepository } from "../../class-schedule/domain/IClassScheduleRepository.js";
import type { IClassRepository } from "../../classes/domain/IClassRepository.js";

export class TeacherServices {
    constructor(
        private readonly teacherRepository: ITeacherRepository,
        private readonly classScheduleRepository: IClassScheduleRepository,
        private readonly assignmentRepository: IAssignmentRepository,
        private readonly classRepository: IClassRepository
    ) {}

    private normalizeCreate(credentials: TeacherCreateCredentials): TeacherCreateCredentials {
        return {
            ...credentials,
            firstName: normalizeText(credentials.firstName),
            middleName: normalizeOptionalText(credentials.middleName),
            firstLastName: normalizeText(credentials.firstLastName),
            secondLastName: normalizeOptionalText(credentials.secondLastName),
            userName: normalizeOptionalText(credentials.userName),
            phone: nullifyEmpty(credentials.phone),
            email: normalizeText(credentials.email),
        };
    }

    private normalizeUpdate(credentials: TeacherUpdateCredentials): TeacherUpdateCredentials {
        return {
            ...credentials,
            firstName: normalizeText(credentials.firstName),
            middleName: normalizeOptionalText(credentials.middleName),
            firstLastName: normalizeText(credentials.firstLastName),
            secondLastName: normalizeOptionalText(credentials.secondLastName),
            userName: normalizeOptionalText(credentials.userName),
            phone: nullifyEmpty(credentials.phone),
        };
    }

    // NOTE: this is a policy check — teachers can only view their own data.
    // It assumes `teacherId` and `authUser.userId` are in the same id space.
    private assertTeacherOwnership(teacherId: string, authUser: AuthUser): void {
        if (authUser.userRole === 'teacher' && authUser.userId !== teacherId) {
            throw new UnauthorizedError("No tienes permiso para ver el horario de otros profesores");
        }
    }

    async getTeachers(
        available: string | undefined,
        includeTeacherId: string | undefined,
        isActive: boolean,
        authUser: AuthUser
    ): Promise<Teachers[]> {
        const auth = requireAuth(authUser);

        const payload: GetTeachersPayload = { available, includeTeacherId, isActive };
        return this.teacherRepository.getTeachers(payload, auth);
    }

    async getTeacherSchedule(teacherId: string, authUser: AuthUser) {
        const auth = requireAuth(authUser);
        if (!teacherId) throw new ValidationError("El ID del profesor es obligatorio");

        this.assertTeacherOwnership(teacherId, auth);

        // The repo scopes by school now — principals can't cross tenants.
        return this.classScheduleRepository.getTeacherSchedule(teacherId, auth);
    }

    async getTeacherCalendar(teacherId: string, startDate: string, endDate: string, authUser: AuthUser) {
        const auth = requireAuth(authUser);
        if (!teacherId || !startDate || !endDate) {
            throw new ValidationError("El ID del profesor y fecha son obligatorios");
        }

        this.assertTeacherOwnership(teacherId, auth);

        const assignments = await this.assignmentRepository.getAssignmentsByTeacherAndDate(teacherId, startDate, endDate, auth);

        return [
            ...assignments.map(a => ({ type: 'assignment', ...a })),
        ];
    }

    async getTeacherDetails(teacherId: string, authUser: AuthUser): Promise<TeacherDetails> {
        const auth = requireAuth(authUser);
        if (!teacherId) throw new ValidationError("El ID del maestro es obligatorio");

        const teacher = await this.teacherRepository.getTeacherDetails(teacherId, auth);
        if (!teacher) throw new NotFoundError("No se encontró el maestro");
        const classes = await this.classRepository.getTeacherClassesProfile(teacherId, auth);
        return { teacher, classes };
    }

    async createTeacher(credentials: TeacherCreateCredentials, authUser: AuthUser): Promise<CreateTeacher> {
        const auth = requireAuth(authUser);

        const normalized = this.normalizeCreate(credentials);

        if (!normalized.firstName || !normalized.firstLastName || !normalized.password || !normalized.email) {
            throw new ValidationError("Faltan campos obligatorios del formulario");
        }

        return this.teacherRepository.createTeacher(normalized, auth);
    }

    async updateTeacher(credentials: TeacherUpdateCredentials, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!credentials.teacherId) throw new ValidationError("El ID del maestro es obligatorio");

        const normalized = this.normalizeUpdate(credentials);

        if (!normalized.firstName || !normalized.firstLastName) {
            throw new ValidationError("Faltan campos obligatorios");
        }

        await this.teacherRepository.updateTeacher(normalized, auth);
    }

    async deleteTeacher(teacherId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!teacherId) throw new ValidationError("El ID del maestro es obligatorio");

        await this.teacherRepository.deleteTeacher(teacherId, auth);
    }
}