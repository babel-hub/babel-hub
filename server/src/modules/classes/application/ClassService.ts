import type { IClassRepository } from "../domain/IClassRepository.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { ClassDetails } from "../domain/Classes.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {IStudentRepository} from "../../student/domain/IStudentRepository.js";

export class ClassService {
    constructor(
        private readonly classRepository: IClassRepository,
        private readonly studentRepository: IStudentRepository,
    ) {}

    async getClassDetails(classId: string, schoolId: string, isActive: boolean): Promise<ClassDetails> {
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");
        if (!schoolId) throw new UnauthorizedError("Falta el ID del colegio.");

        const classDetails = await this.classRepository.getClassDetails(classId, schoolId, isActive);

        if (!classDetails) {
            throw new NotFoundError("La clase no existe o no tienes acceso a ella.");
        }

        const students = await this.studentRepository.getClassStudents(classDetails.course_id, isActive);

        return {
            details: classDetails,
            students: students
        };
    }

    async createClass(courseId: string, subjectId: string, teacherId: string, authUser: AuthUser) {
        if (!courseId || !subjectId || !teacherId) {
            throw new ValidationError("Faltan parámetros obligatorios (Curso, Asignatura o Profesor).");
        }

        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        return await this.classRepository.createClass(courseId, subjectId, teacherId, authUser);
    }

    async updateClass(classId: string, teacherId: string, authUser: AuthUser) {
        if (!classId || !teacherId) {
            throw new ValidationError("El ID de la clase y el nuevo profesor son obligatorios.");
        }
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        return await this.classRepository.updateClass(classId, teacherId, authUser);
    }

    async deleteClass(classId: string, authUser: AuthUser) {
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError("Credenciales de usuario inválidas o incompletas.");
        }

        return await this.classRepository.deleteClass(classId, authUser);
    }

    async getTeacherClasses(teacherId: string, teacherSchoolId: string, isActive: boolean) {
        if (!teacherId) throw new ValidationError("El ID del profesor es obligatorio.");
        if (!teacherSchoolId) throw new UnauthorizedError("Falta el ID del colegio.");

        return await this.classRepository.getTeacherClasses(teacherId, teacherSchoolId, isActive);
    }

    async getTeacherClassDetails(classId: string, teacherId: string, teacherSchoolId: string) {
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");
        if (!teacherId || !teacherSchoolId) throw new UnauthorizedError("Credenciales del profesor inválidas o incompletas.");

        const details = await this.classRepository.getTeacherClassDetails(classId, teacherId, teacherSchoolId);

        if (!details) {
            throw new NotFoundError("La clase no existe o no pertenece a este profesor.");
        }

        return details;
    }
}