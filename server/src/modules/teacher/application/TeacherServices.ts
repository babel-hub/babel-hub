import type { ITeacherRepository } from "../domain/ITeacherRepository.js";
import type { CreateTeacher, TeacherDetails, Teachers } from "../domain/Teacher.types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser, TeacherCreateCredentials, TeacherUpdateCredentials } from "../../shared/domain/Shared.types.js";
import {normalizeOptionalText, normalizeText, nullifyEmpty} from "../../shared/domain/normalize.js";

export class TeacherServices {
    constructor( private readonly teacherRepository : ITeacherRepository ) {}

    async getTeachers(userSchoolId: string, available: string | undefined, includeTeacherId: string | undefined, isActive: boolean): Promise<Teachers[]> {
        return await this.teacherRepository.getTeachers(userSchoolId, available, includeTeacherId, isActive);
    }

    async getTeacherDetails(teacherId: string, userSchoolId: string): Promise<TeacherDetails> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!teacherId) throw new ValidationError("El ID de maestro es obligatorio");

        const teacher = await this.teacherRepository.getTeacherDetails(teacherId, userSchoolId);
        if (!teacher) throw new NotFoundError("No se encontró el maestro");

        return teacher;
    }

    async createTeacher(teacherCredentials: TeacherCreateCredentials, authUser: AuthUser): Promise<CreateTeacher> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        const normalized = {
            ...teacherCredentials,
            firstName: normalizeText(teacherCredentials.firstName),
            middleName: normalizeOptionalText(teacherCredentials.middleName),
            firstLastName: normalizeText(teacherCredentials.firstLastName),
            secondLastName: normalizeOptionalText(teacherCredentials.secondLastName),
            userName: normalizeOptionalText(teacherCredentials.userName),
            phone: nullifyEmpty(teacherCredentials.phone),
            email: normalizeText(teacherCredentials.email),
        }

        if (!normalized.firstName ||
            !normalized.firstLastName ||
            !normalized.password ||
            !normalized.email) throw new ValidationError("Faltan campos obligatorios del formulario");

        return await this.teacherRepository.createTeacher(normalized, authUser);
    }

    async updateTeacher(teacherCredentials: TeacherUpdateCredentials, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        const normalized = {
            ...teacherCredentials,
            firstName: normalizeText(teacherCredentials.firstName),
            middleName: normalizeOptionalText(teacherCredentials.middleName),
            firstLastName: normalizeText(teacherCredentials.firstLastName),
            secondLastName: normalizeOptionalText(teacherCredentials.secondLastName),
            userName: normalizeOptionalText(teacherCredentials.userName),
            phone: nullifyEmpty(teacherCredentials.phone),
        }

        if (!normalized.firstName || !normalized.firstLastName) throw new ValidationError("Faltan campos obligatorios");
        if (!normalized.teacherId) throw new ValidationError("El ID del maestro es obligatorio");

        return await this.teacherRepository.updateTeacher(normalized, authUser);
    }

    async deleteTeacher(teacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!teacherId) throw new ValidationError("El ID del maestro es obligatorio");

        return await this.teacherRepository.deleteTeacher(teacherId, userId, userRole, userSchoolId);
    }
}