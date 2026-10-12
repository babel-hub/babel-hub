import type { ICourseRepository } from "../domain/ICourseRepository.js";
import type {
    CourseDetails,
    Courses,
    TeacherCourse,
    CreateCoursePayload,
    UpdateCoursePayload,
    GetCoursesPayload,
    GetCourseDetailsPayload
} from "../domain/Course.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { IStudentRepository } from "../../student/domain/IStudentRepository.js";
import type { IClassRepository } from "../../classes/domain/IClassRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class CourseService {
    constructor(
        private readonly courseRepository: ICourseRepository,
        private readonly studentRepository: IStudentRepository,
        private readonly classRepository: IClassRepository,
    ) {}

    private validate(payload: Pick<CreateCoursePayload, "courseName" | "courseYear" | "courseTeacherId">): void {
        if (!payload.courseName?.trim() || !payload.courseYear?.trim() || !payload.courseTeacherId?.trim()) {
            throw new ValidationError("Faltan campos obligatorios");
        }
        if (!/^\d+$/.test(payload.courseName.trim())) {
            throw new ValidationError("El nombre del curso debe ser numérico");
        }
    }

    async getCourses(isActive: boolean, authUser: AuthUser): Promise<Courses[]> {
        const auth = requireAuth(authUser);

        const payload: GetCoursesPayload = { isActive };
        return this.courseRepository.getCourses(payload, auth);
    }

    async getCourseDetails(
        courseId: string,
        isActive: boolean,
        authUser: AuthUser
    ): Promise<CourseDetails> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio.");

        const payload: GetCourseDetailsPayload = { courseId, isActive };
        const course = await this.courseRepository.getCourseDetails(payload, auth);

        if (!course) {
            throw new NotFoundError("El curso no existe o no tienes acceso a él.");
        }

        // check multi tenant
        const [students, classes] = await Promise.all([
            this.studentRepository.getClassStudents({courseId, isActive}, auth),
            this.classRepository.getCourseClasses(courseId, isActive, auth)
        ]);

        return { course, students, classes };
    }

    async createCourse(payload: CreateCoursePayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        this.validate(payload);

        await this.courseRepository.createCourse(payload, auth);
    }

    async updateCourse(payload: UpdateCoursePayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!payload.courseId) throw new ValidationError("El ID del curso es obligatorio");
        this.validate(payload);

        await this.courseRepository.updateCourse(payload, auth);
    }

    async deleteCourse(courseId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");

        await this.courseRepository.deleteCourse({ courseId }, auth);
    }

    async getTeacherCourse(authUser: AuthUser): Promise<TeacherCourse> {
        const auth = requireAuth(authUser);
        return this.courseRepository.getTeacherCourse(auth);
    }
}