import type {
    IStudentRepository
} from "../domain/IStudentRepository.js";
import type {
    StudentByName,
    StudentProfileData,
    Students,
    ClassStudents, GetStudentsPayload, GetClassStudentsPayload, GetStudentsByNamePayload
} from "../domain/Student.types.js";
import { NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type {
    AuthUser,
    StudentCreateCredentials,
    StudentUpdateCredentials
} from "../../shared/domain/Shared.types.js";
import { normalizeOptionalText, normalizeText, nullifyEmpty } from "../../shared/domain/normalize.js";
import type { IParentRepository } from "../../parent/domain/IParentRepository.js";
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type { IClassRepository } from "../../classes/domain/IClassRepository.js";
import type { IAttendanceRepository } from "../../attendance/domain/IAttendanceRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class StudentService {
    constructor(
        private readonly studentRepository: IStudentRepository,
        private readonly parentRepository: IParentRepository,
        private readonly gradesRepository: IGradeRepository,
        private readonly classRepository: IClassRepository,
        private readonly attendanceRepository: IAttendanceRepository
    ) {}

    private normalizeCreate(credentials: StudentCreateCredentials): StudentCreateCredentials {
        return {
            ...credentials,
            firstName: normalizeText(credentials.firstName),
            middleName: normalizeOptionalText(credentials.middleName),
            firstLastName: normalizeText(credentials.firstLastName),
            secondLastName: normalizeOptionalText(credentials.secondLastName),
            email: normalizeText(credentials.email),
            userName: normalizeOptionalText(credentials.userName),
            enrollmentCode: normalizeOptionalText(credentials.enrollmentCode),
            phone: nullifyEmpty(credentials.phone)
        };
    }

    private normalizeUpdate(credentials: StudentUpdateCredentials): StudentUpdateCredentials {
        return {
            ...credentials,
            firstName: normalizeText(credentials.firstName),
            middleName: normalizeOptionalText(credentials.middleName),
            firstLastName: normalizeText(credentials.firstLastName),
            secondLastName: normalizeOptionalText(credentials.secondLastName),
            userName: normalizeOptionalText(credentials.userName),
            enrollmentCode: normalizeOptionalText(credentials.enrollmentCode),
            phone: nullifyEmpty(credentials.phone),
        };
    }

    async getStudents(isActive: boolean, authUser: AuthUser): Promise<Students[]> {
        const auth = requireAuth(authUser);
        const payload: GetStudentsPayload = { isActive };
        return this.studentRepository.getStudents(payload, auth);
    }

    async getStudentDetails(
        studentId: string,
        periodId: string,
        startDate: string,
        endDate: string,
        authUser: AuthUser
    ): Promise<StudentProfileData> {
        const auth = requireAuth(authUser);
        if (!studentId || !periodId) throw new ValidationError("El ID del estudiante y el periodo son obligatorios");

        const student = await this.studentRepository.getStudentProfile(studentId, auth);
        if (!student) throw new NotFoundError("El estudiante no existe");

        const [classes, grades, attendance, parents] = await Promise.all([
            this.classRepository.getStudentProfileClasses(student.course_id, auth),
            this.gradesRepository.getStudentProfileGrades(studentId, periodId, auth),
            this.attendanceRepository.getCalendarAttendance({ studentId, startDate, endDate }, auth),
            this.parentRepository.getParentByStudentId(studentId, auth)
        ]);

        return {
            ...student,
            parents,
            current_classes: classes,
            recent_grades: grades,
            attendance_summary: attendance
        };
    }

    async getStudentsByName(query: string, limit: number, authUser: AuthUser): Promise<StudentByName[]> {
        const auth = requireAuth(authUser);
        if (!query?.trim()) throw new ValidationError("El término de búsqueda es obligatorio");

        const payload: GetStudentsByNamePayload = { query: query.trim(), limit };
        return this.studentRepository.getStudentsByName(payload, auth);
    }

    async createStudent(credentials: StudentCreateCredentials, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        const normalized = this.normalizeCreate(credentials);

        if (!normalized.courseId || !normalized.email || !normalized.password || !normalized.firstName || !normalized.firstLastName) {
            throw new ValidationError("Faltan campos obligatorios");
        }

        return this.studentRepository.createStudent(normalized, auth);
    }

    async updateStudent(credentials: StudentUpdateCredentials, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!credentials.studentId) throw new ValidationError("El ID del estudiante es obligatorio");

        const normalized = this.normalizeUpdate(credentials);

        if (!normalized.courseId || !normalized.firstName || !normalized.firstLastName) {
            throw new ValidationError("Faltan campos obligatorios");
        }

        await this.studentRepository.updateStudent(normalized, auth);
    }

    async deleteStudent(studentId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!studentId) throw new ValidationError("El ID del estudiante es obligatorio");
        await this.studentRepository.deleteStudent(studentId, auth);
    }
}