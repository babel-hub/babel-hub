import type { ICourseRepository } from "../domain/ICourseRepository.js";
import type {
    CourseDetails,
    Courses,
    CreateCourse,
    TeacherCourse, UpdateCourse
} from "../domain/Course.types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type {IStudentRepository} from "../../student/domain/IStudentRepository.js";
import type {IClassRepository} from "../../classes/domain/IClassRepository.js";

export class CourseService {
    constructor(
        private readonly courseRepository: ICourseRepository,
        private readonly studentRepository: IStudentRepository,
        private readonly classRepository: IClassRepository,
    ) {}

    async getCourses(userSchoolId: string, isActive: boolean): Promise<Courses[]> {
        if (!userSchoolId) throw new UnauthorizedError("Falta el ID del colegio");

        return this.courseRepository.getCourses(userSchoolId, isActive);
    }

    async getCourseDetails(courseId: string, userSchoolId: string, isActive: boolean): Promise<CourseDetails> {
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio.");
        if (!userSchoolId) throw new UnauthorizedError("Falta el ID del colegio.");

        const course = await this.courseRepository.getCourseDetails(courseId, userSchoolId, isActive);

        if (!course) {
            throw new NotFoundError("El curso no existe o no tienes acceso a él.");
        }

        const [students, classes] = await Promise.all([
            this.studentRepository.getClassStudents(courseId, isActive),
            this.classRepository.getCourseClasses(courseId, isActive)
        ]);

        return {
            course,
            students,
            classes
        };
    }

    async createCourse(courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<CreateCourse> {
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");
        if (!courseYear || !courseTeacherId || !courseName) throw new ValidationError("Faltan campos obligatorios");

        return await this.courseRepository.createCourse(courseName, courseYear, courseTeacherId, userId, userRole, userSchoolId);
    }

    async updateCourse(courseId: string, courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string): Promise<UpdateCourse> {
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");
        if (!courseYear || !courseTeacherId || !courseName) throw new ValidationError("Faltan campos obligatorios");
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");

        return await this.courseRepository.updateCourse(courseId, courseName, courseYear, courseTeacherId, userId, userRole, userSchoolId);
    }

    async deleteCourse(courseId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");

        await this.courseRepository.deleteCourse(courseId, userId, userRole, userSchoolId);
    }

    async getTeacherCourse(userId: string, userSchoolId: string): Promise<TeacherCourse> {
        if (!userId || !userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario");

        return this.courseRepository.getTeacherCourse(userId, userSchoolId);
    }
}