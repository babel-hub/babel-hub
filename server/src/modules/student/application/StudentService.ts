import type { IStudentRepository } from "../domain/IStudentRepository.js";
import type {
    CreateStudent, StudentBaseRow,
    StudentByName,
    StudentProfileData,
    Students
} from "../domain/Student.types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser, StudentCreateCredentials, StudentUpdateCredentials } from "../../shared/domain/Shared.types.js";
import { normalizeOptionalText, normalizeText, nullifyEmpty } from "../../shared/domain/normalize.js";
import type { IParentRepository } from "../../parent/domain/IParentRepository.js";
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type { IClassRepository } from "../../classes/domain/IClassRepository.js";
import type { IAttendanceRepository } from "../../attendance/domain/IAttendanceRepository.js";

export class StudentService {
    constructor (
        private readonly studentRepository: IStudentRepository,
        private readonly parentRepository: IParentRepository,
        private readonly gradesRepository: IGradeRepository,
        private readonly classRepository: IClassRepository,
        private readonly attendanceRepository: IAttendanceRepository
    ) {}

    async getStudents(userSchoolId: string, isActive: boolean): Promise<Students[]> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");

        return await this.studentRepository.getStudents(userSchoolId, isActive);
    }

    async getStudentDetails(studentId: string, periodId: string, startDate: string, endDate: string, userSchoolId: string): Promise<StudentProfileData> {
        if (!userSchoolId) throw new UnauthorizedError("Faltan credenciales del usuario (master)");
        if (!studentId || !periodId) throw new ValidationError("El ID del estudiante y el periodo son obligatorios");

        const student = await this.studentRepository.getStudentProfile(studentId, userSchoolId);
        if (!student) throw new NotFoundError("El estudiante no existe");

        const [classes, grades, attendance, parents] = await Promise.all([
            this.classRepository.getStudentProfileClasses(student.course_id),
            this.gradesRepository.getStudentProfileGrades(studentId, periodId),
            this.attendanceRepository.getStudentProfileAttendance(studentId, startDate, endDate),
            this.parentRepository.getParentByStudentId(studentId)
        ]);

        const attendanceSummary = { total_classes: 0, present: 0, absent: 0, late: 0, excused: 0 };
        attendance.forEach(row => {
            const count = parseInt(row.count);
            attendanceSummary.total_classes += count;
            if (row.status === 'present') attendanceSummary.present = count;
            if (row.status === 'absent') attendanceSummary.absent = count;
            if (row.status === 'late') attendanceSummary.late = count;
            if (row.status === 'excused') attendanceSummary.excused = count;
        });

        return {
            ...student,
            parents: parents,
            current_classes: classes,
            recent_grades: grades,
            attendance_summary: attendanceSummary
        };
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