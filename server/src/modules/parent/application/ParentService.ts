import type { IParentRepository } from "../domain/IParentRepository.js";
import type { AuthUser, ParentCredentials } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import type {
    DailyScheduleWithBreaks, LinkParentToStudentPayload,
    Parent,
    ParentStudent,
    RelationTypes,
    StudentParentRow,
    TimelineItem
} from "../domain/Parent.types.js";
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type { IAttendanceRepository } from "../../attendance/domain/IAttendanceRepository.js";
import type { StudentDailyGrade, StudentGrade, SubjectAccumulated } from "../../grade/domain/Grade.types.js";
import { normalizeOptionalText, normalizeText, nullifyEmpty } from "../../shared/domain/normalize.js";
import type { ICourseBreakRepository } from "../../course-break/domain/ICourseBreakRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class ParentService {
    constructor(
        private readonly parentRepository: IParentRepository,
        private readonly gradeRepository: IGradeRepository,
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly courseBreakRepository: ICourseBreakRepository
    ) {}

    private normalizeCredentials(credentials: ParentCredentials): ParentCredentials {
        return {
            ...credentials,
            firstName: normalizeText(credentials.firstName),
            middleName: normalizeOptionalText(credentials.middleName),
            firstLastName: normalizeText(credentials.firstLastName),
            secondLastName: normalizeOptionalText(credentials.secondLastName),
            email: normalizeText(credentials.email),
            userName: normalizeOptionalText(credentials.userName),
            phone: nullifyEmpty(credentials.phone),
        };
    }

    private validateCredentials(credentials: ParentCredentials): void {
        if (!credentials.email || !credentials.firstName || !credentials.firstLastName || !credentials.password) {
            throw new ValidationError("Faltan campos obligatorios del formulario");
        }
    }

    async getParents(authUser: AuthUser): Promise<Parent[]> {
        const auth = requireAuth(authUser);
        return this.parentRepository.getParents(auth);
    }

    async getParentStudents(authUser: AuthUser): Promise<ParentStudent[]> {
        const auth = requireAuth(authUser);
        return this.parentRepository.getParentStudents(auth);
    }

    async getParentByStudentId(studentId: string, authUser: AuthUser): Promise<StudentParentRow[]> {
        const auth = requireAuth(authUser);
        if (!studentId) throw new ValidationError("El id del estudiante no está siendo enviado");
        return this.parentRepository.getParentByStudentId(studentId, auth);
    }

    async getAccumulatedGradesBySubject(
        studentId: string,
        classId: string,
        periodId: string,
        subjectName: string,
        authUser: AuthUser
    ): Promise<SubjectAccumulated> {
        const auth = requireAuth(authUser);
        if (!studentId || !classId || !subjectName || !periodId) {
            throw new ValidationError("Hay campos que no están siendo enviados");
        }
        return this.gradeRepository.getAccumulatedGradesBySubject({ studentId, classId, periodId, subjectName }, auth);
    }

    async getStudentGrades(studentId: string, periodId: string, authUser: AuthUser): Promise<StudentGrade[]> {
        const auth = requireAuth(authUser);
        if (!studentId || !periodId) throw new ValidationError("Hay campos que no están siendo enviados");
        return this.gradeRepository.getStudentGrades(studentId, periodId, auth);
    }

    async getStudentDailyGrades(studentId: string, date: string, authUser: AuthUser): Promise<StudentDailyGrade[]> {
        const auth = requireAuth(authUser);
        if (!studentId) throw new ValidationError("El id del estudiante no está siendo enviado");
        if (!date) throw new ValidationError("El campo de la fecha no está siendo enviado");
        return this.gradeRepository.getStudentDailyGrades(studentId, date, auth);
    }

    async getStudentDailyAttendance(
        courseId: string,
        studentId: string,
        date: string,
        authUser: AuthUser
    ): Promise<DailyScheduleWithBreaks> {
        const auth = requireAuth(authUser);
        if (!studentId || !courseId) throw new ValidationError("El id del estudiante o del curso no están siendo enviados");
        if (!date) throw new ValidationError("El campo de la fecha no está siendo enviado");

        const [classes, breaks] = await Promise.all([
            this.attendanceRepository.getStudentDailyAttendance(studentId, date, auth),
            this.courseBreakRepository.getCourseBreaksByDate({ courseId, date }, auth)
        ]);

        const timelineItems: TimelineItem[] = [
            ...classes.map((c) => ({ ...c, type: "class" as const })),
            ...breaks.map((b) => ({ ...b, type: "break" as const })),
        ].sort((a, b) => a.start_time.localeCompare(b.start_time));

        return { timeline: timelineItems };
    }

    async createParent(parentCredentials: ParentCredentials, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        const normalized = this.normalizeCredentials(parentCredentials);
        this.validateCredentials(normalized);

        await this.parentRepository.createParent(normalized, auth);
    }

    async linkParentToStudent(
        parentId: string,
        studentId: string,
        type: RelationTypes,
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);
        if (!parentId || !studentId || !type) {
            throw new ValidationError("Faltan campos obligatorios del formulario");
        }

        const payload: LinkParentToStudentPayload = { parentId, studentId, type };
        await this.parentRepository.linkParentToStudent(payload, auth);
    }

    async deleteParent(parentId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!parentId) throw new ValidationError("El id del acudiente no existe");
        await this.parentRepository.deleteParent(parentId, auth);
    }

    async deleteParentStudent(id: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!id) throw new ValidationError("El id del registro no está siendo enviado");
        await this.parentRepository.deleteParentStudent(id, auth);
    }
}