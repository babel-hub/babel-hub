import type { IClassRepository } from "../domain/IClassRepository.js";
import type { ClassDetails, CreateClass, CreateClassPayload } from "../domain/Classes.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { IStudentRepository } from "../../student/domain/IStudentRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class ClassService {
    constructor(
        private readonly classRepository: IClassRepository,
        private readonly studentRepository: IStudentRepository,
    ) {}

    async getClassDetails(classId: string, isActive: boolean, authUser: AuthUser): Promise<ClassDetails> {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");

        const classDetails = await this.classRepository.getClassDetails(classId, isActive, auth);
        if (!classDetails) {
            throw new NotFoundError("La clase no existe o no tienes acceso a ella.");
        }

        const students = await this.studentRepository.getClassStudents(
            { courseId: classDetails.course_id, isActive },
            auth
        );

        return {
            details: classDetails,
            students
        };
    }

    async createClass(payload: CreateClassPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!payload.courseId || !payload.subjectId || !payload.teacherId) {
            throw new ValidationError("Faltan parámetros obligatorios (Curso, Asignatura o Profesor).");
        }

        await this.classRepository.createClass(payload, auth);
    }

    async updateClass(classId: string, teacherId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!classId || !teacherId) {
            throw new ValidationError("El ID de la clase y el nuevo profesor son obligatorios.");
        }

        await this.classRepository.updateClass(classId, teacherId, auth);
    }

    async deleteClass(classId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");

        await this.classRepository.deleteClass(classId, auth);
    }

    async getTeacherClasses(teacherId: string, isActive: boolean, authUser: AuthUser) {
        const auth = requireAuth(authUser);
        if (!teacherId) throw new ValidationError("El ID del profesor es obligatorio.");

        return this.classRepository.getTeacherClasses(teacherId, isActive, auth);
    }

    async getTeacherClassDetails(classId: string, teacherId: string, authUser: AuthUser) {
        const auth = requireAuth(authUser);
        if (!classId) throw new ValidationError("El ID de la clase es obligatorio.");
        if (!teacherId) throw new ValidationError("El ID del profesor es obligatorio.");

        const details = await this.classRepository.getTeacherClassDetails(classId, teacherId, auth);
        if (!details) {
            throw new NotFoundError("La clase no existe o no pertenece a este profesor.");
        }

        return details;
    }
}