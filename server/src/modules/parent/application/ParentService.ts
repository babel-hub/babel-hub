import type { IParentRepository } from "../domain/IParentRepository.js";
import type { AuthUser, ParentCredentials } from "../../shared/domain/Shared.types.js";
import {NotFoundError, UnauthorizedError, ValidationError} from "../../errors/domain/CustomErrors.js";
import type {Date, Parent, ParentStudent, RelationTypes} from "../domain/Parent.types.js";
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type { IAttendanceRepository } from "../../attendance/domain/IAttendanceRepository.js";
import type { StudentGrade } from "../../grade/domain/Grade.types.js";
import type { DailyAttendance } from "../../attendance/domain/Attendance.types.js";
import {normalizeOptionalText, normalizeText, nullifyEmpty} from "../../shared/domain/normalize.js";

export class ParentService {
    constructor(
        private readonly parentRepository: IParentRepository,
        private readonly gradeRepository: IGradeRepository,
        private readonly attendanceRepository: IAttendanceRepository,
    ) {}

    private async assertParentOwnsStudent(studentId: string, authUser: AuthUser): Promise<void> {
        const students = await this.parentRepository.getParentStudents(authUser);
        const owns = students.some(s => s.student_id === studentId);
        if (!owns) throw new NotFoundError("No tienes acceso a este estudiante");
    }

    async getParents(userSchoolId: string): Promise<Parent[]> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return await this.parentRepository.getParents(userSchoolId);
    }

    async getParentStudents(authUser: AuthUser): Promise<ParentStudent[]> {
        if (!authUser.userSchoolId || !authUser.userRole || !authUser.userId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return await this.parentRepository.getParentStudents(authUser);
    }

    async getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]> {
        if (!authUser.userId || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");
        if (!studentId || !periodId) throw new ValidationError("Hay campos que no estan siendo enviados");

        await this.assertParentOwnsStudent(studentId, authUser);

        return await this.gradeRepository.getStudentGrades(studentId, periodId);
    }

    async getStudentAttendance(studentId: string, date: Date, authUser: AuthUser): Promise<DailyAttendance[]> {
        if (!authUser.userId || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");
        if (!studentId) throw new ValidationError("El id del estudiante no esta siendo enviado");
        if (!date.start || !date.end || !date.date) throw new ValidationError("El campo de las fechas no esta siendo enviado");

        await this.assertParentOwnsStudent(studentId, authUser);

        return await this.attendanceRepository.getStudentAttendance(studentId, date.start, date.end, date.date);
    }

    async createParent(parentCredentials: ParentCredentials, authUser: AuthUser): Promise<void> {
        if (!authUser.userSchoolId || !authUser.userRole || !authUser.userId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        const normalized = {
            ...parentCredentials,
            firstName: normalizeText(parentCredentials.firstName),
            middleName: normalizeOptionalText(parentCredentials.middleName),
            firstLastName: normalizeText(parentCredentials.firstLastName),
            secondLastName: normalizeOptionalText(parentCredentials.secondLastName),
            email: normalizeText(parentCredentials.email),
            userName: normalizeOptionalText(parentCredentials.userName),
            phone: nullifyEmpty(parentCredentials.phone),
        }

        if (
            !normalized.email ||
            !normalized.firstName ||
            !normalized.firstLastName ||
            !normalized.password
        ) throw new ValidationError("Faltan campos obligatorios del formulario");

        return await this.parentRepository.createParent(normalized, authUser);
    }

    async linkedParentToStudent(parentId: string, studentId: string, type: RelationTypes, authUser: AuthUser): Promise<void> {
        if (!parentId || !studentId || !type) throw new ValidationError("Faltan campos obligatorios del formulario");
        if (!authUser.userSchoolId || !authUser.userRole || !authUser.userId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return await this.parentRepository.linkedParentToStudent(parentId, studentId, type, authUser);
    }

    async deleteParent(parentId: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userSchoolId || !authUser.userRole || !authUser.userId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!parentId) throw new ValidationError("El id del acudiente no existe");

        return await this.parentRepository.deleteParent(parentId, authUser);
    }
}