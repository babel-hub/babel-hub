import type { IStudentRepository } from "../domain/IStudentRepository.js";
import type { CreateStudent, StudentByName, StudentDetails, Students } from "../domain/Student.types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser, StudentCreateCredentials, StudentUpdateCredentials } from "../../shared/domain/Shared.types.js";
import {normalizeOptionalText, normalizeText, nullifyEmpty} from "../../shared/domain/normalize.js";

export class StudentService {
    constructor( private readonly studentRepository: IStudentRepository ) {}

    async getStudents(userSchoolId: string, isActive: boolean): Promise<Students[]> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return await this.studentRepository.getStudents(userSchoolId, isActive);
    }

    async getStudentDetails(studentId: string, userSchoolId: string): Promise<StudentDetails> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!studentId) throw new ValidationError("El ID del estudiante es obligatorio");

        const student = await this.studentRepository.getStudentDetails(studentId, userSchoolId);

        if (!student) throw new NotFoundError("El estudiante no existe");
        return student;
    }

    async getStudentsByName(query: string, authUser: AuthUser, limit: number): Promise<StudentByName[]> {
        if (!authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");

        return this.studentRepository.getStudentsByName(query, authUser, limit);
    }

    async createStudent(studentCredentials: StudentCreateCredentials, authUser: AuthUser): Promise<CreateStudent> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        const normalized = {
            ...studentCredentials,
            firstName: normalizeText(studentCredentials.firstName),
            middleName: normalizeOptionalText(studentCredentials.middleName),
            firstLastName: normalizeText(studentCredentials.firstLastName),
            secondLastName: normalizeOptionalText(studentCredentials.secondLastName),
            email: normalizeText(studentCredentials.email),
            userName: normalizeOptionalText(studentCredentials.userName),
            enrollmentCode: nullifyEmpty(studentCredentials.enrollmentCode),
            phone: nullifyEmpty(studentCredentials.phone),
        }

        if (!normalized.courseId ||
            !normalized.email ||
            !normalized.password ||
            !normalized.firstName ||
            !normalized.firstLastName
        ) throw new ValidationError("Faltan campos obligatorios");

        return await this.studentRepository.createStudent(normalized, authUser);
    }

    async updateStudent(studentCredentials: StudentUpdateCredentials, authUser: AuthUser): Promise<void> {
        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        const normalized = {
            ...studentCredentials,
            firstName: normalizeText(studentCredentials.firstName),
            middleName: normalizeOptionalText(studentCredentials.middleName),
            firstLastName: normalizeText(studentCredentials.firstLastName),
            secondLastName: normalizeOptionalText(studentCredentials.secondLastName),
            userName: normalizeOptionalText(studentCredentials.userName),
            enrollmentCode: nullifyEmpty(studentCredentials.enrollmentCode),
            phone: nullifyEmpty(studentCredentials.phone),
        }

        if (!normalized.courseId ||
            !normalized.firstName ||
            !normalized.firstLastName
        ) throw new ValidationError("Faltan campos obligatorios");

        return await this.studentRepository.updateStudent(normalized, authUser);
    }

    async deleteStudent(studentId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!studentId) throw new ValidationError("El ID del estudiante es obligatorio");

        return await this.studentRepository.deleteStudent(studentId, userId, userRole, userSchoolId);
    }
}