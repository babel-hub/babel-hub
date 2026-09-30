import type { IAttendanceRepository } from "../domain/IAttendanceRepository.js";
import type {
    AttendanceSummary,
    BulkRecords,
    CalendarAttendance,
    ClassAttendance,
    CourseAttendance,
    CourseDailyAttendance,
    DailyAttendance
} from "../domain/Attendance.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export class AttendanceService {
    constructor(
        private readonly attendanceRepository: IAttendanceRepository
    ) {}

    async getDailyClassAttendance(classId: string, schoolId: string, date: string, isActive: boolean): Promise<ClassAttendance[]> {
        if (!schoolId) throw new UnauthorizedError('Falta el ID del colegio.');
        if (!date || !classId) throw new ValidationError('La información suministrada está incompleta o es errónea.');

        return this.attendanceRepository.getDailyClassAttendance(classId, schoolId, date, isActive);
    }

    async getDailyCourseAttendance(courseId: string, schoolId: string, date: string, isActive: boolean): Promise<CourseDailyAttendance[]> {
        if (!schoolId) throw new UnauthorizedError('Falta el ID del colegio.');
        if (!date || !courseId) throw new ValidationError('La información suministrada está incompleta o es errónea.');

        return this.attendanceRepository.getDailyCourseAttendance(courseId, schoolId, date, isActive);
    }

    async getAttendanceSummary(schoolId: string, today: string, startDate: string, endDate: string, isActive: boolean): Promise<AttendanceSummary[]> {
        if (!schoolId) throw new UnauthorizedError('Falta el ID del colegio.');
        if (!startDate || !endDate || !today) throw new ValidationError("Las fechas son obligatorias.");

        return this.attendanceRepository.getAttendanceSummary(schoolId, today, startDate, endDate, isActive);
    }

    async getCalendarAttendance(studentId: string, schoolId: string, startDate: string, endDate: string): Promise<CalendarAttendance[]> {
        if (!studentId) throw new ValidationError("El ID del estudiante es obligatorio.");
        if (!schoolId) throw new UnauthorizedError("Falta el ID del colegio.");
        if (!startDate || !endDate) throw new ValidationError("Las fechas son obligatorias.");

        return this.attendanceRepository.getCalendarAttendance(studentId, schoolId, startDate, endDate);
    }

    async getClassAttendance(courseId: string, classId: string, schoolId: string, startDate: string, endDate: string): Promise<CourseAttendance[]> {
        if (!classId || !courseId) throw new ValidationError("Credenciales de la clase inválidas.");
        if (!schoolId) throw new UnauthorizedError("Falta el ID del colegio.");
        if (!startDate || !endDate) throw new ValidationError("Las fechas son obligatorias.");

        return this.attendanceRepository.getClassAttendance(courseId, classId, schoolId, startDate, endDate);
    }

    async bulkUpsertAttendance(classId: string, records: BulkRecords[], date: string, authUser: AuthUser): Promise<void> {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError('Credenciales de usuario inválidas o incompletas.');
        }
        if (!date || !classId) throw new ValidationError('La información suministrada está incompleta o es errónea.');
        if (!Array.isArray(records) || records.length === 0) throw new ValidationError("Debes enviar al menos un registro de asistencia.");

        await this.attendanceRepository.bulkUpsertAttendance(classId, records, date, authUser);
    }
}