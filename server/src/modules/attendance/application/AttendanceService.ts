import type {
    IAttendanceRepository
} from "../domain/IAttendanceRepository.js";
import type {
    AttendanceSummary,
    BulkRecords,
    CalendarAttendance,
    ClassAttendance,
    CourseAttendance,
    CourseDailyAttendance,
    DailyAttendance,
    GetDailyClassAttendancePayload,
    GetDailyCourseAttendancePayload,
    GetClassAttendancePayload,
    GetCalendarAttendancePayload,
    GetAttendanceSummaryPayload,
    BulkUpsertAttendancePayload
} from "../domain/Attendance.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class AttendanceService {
    constructor(private readonly attendanceRepository: IAttendanceRepository) {}

    async getDailyClassAttendance(
        classId: string,
        date: string,
        isActive: boolean,
        authUser: AuthUser
    ): Promise<ClassAttendance[]> {
        const auth = requireAuth(authUser);
        if (!date || !classId) {
            throw new ValidationError("La información suministrada está incompleta o es errónea.");
        }

        const payload: GetDailyClassAttendancePayload = { classId, date, isActive };
        return this.attendanceRepository.getDailyClassAttendance(payload, auth);
    }

    async getDailyCourseAttendance(
        courseId: string,
        date: string,
        isActive: boolean,
        authUser: AuthUser
    ): Promise<CourseDailyAttendance[]> {
        const auth = requireAuth(authUser);
        if (!date || !courseId) {
            throw new ValidationError("La información suministrada está incompleta o es errónea.");
        }

        const payload: GetDailyCourseAttendancePayload = { courseId, date, isActive };
        return this.attendanceRepository.getDailyCourseAttendance(payload, auth);
    }

    async getClassAttendance(
        courseId: string,
        classId: string,
        startDate: string,
        endDate: string,
        authUser: AuthUser
    ): Promise<CourseAttendance[]> {
        const auth = requireAuth(authUser);
        if (!classId || !courseId) throw new ValidationError("Credenciales de la clase inválidas.");
        if (!startDate || !endDate) throw new ValidationError("Las fechas son obligatorias.");

        const payload: GetClassAttendancePayload = { courseId, classId, startDate, endDate };
        return this.attendanceRepository.getClassAttendance(payload, auth);
    }

    async getCalendarAttendance(
        studentId: string,
        startDate: string,
        endDate: string,
        authUser: AuthUser
    ): Promise<CalendarAttendance[]> {
        const auth = requireAuth(authUser);
        if (!studentId) throw new ValidationError("El ID del estudiante es obligatorio.");
        if (!startDate || !endDate) throw new ValidationError("Las fechas son obligatorias.");

        const payload: GetCalendarAttendancePayload = { studentId, startDate, endDate };
        return this.attendanceRepository.getCalendarAttendance(payload, auth);
    }

    async getAttendanceSummary(
        today: string,
        startDate: string,
        endDate: string,
        isActive: boolean,
        authUser: AuthUser
    ): Promise<AttendanceSummary[]> {
        const auth = requireAuth(authUser);
        if (!startDate || !endDate || !today) throw new ValidationError("Las fechas son obligatorias.");

        const payload: GetAttendanceSummaryPayload = { today, startDate, endDate, isActive };
        return this.attendanceRepository.getAttendanceSummary(payload, auth);
    }

    async bulkUpsertAttendance(
        classId: string,
        records: BulkRecords[],
        date: string,
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);
        if (!date || !classId) {
            throw new ValidationError("La información suministrada está incompleta o es errónea.");
        }
        if (!Array.isArray(records) || records.length === 0) {
            throw new ValidationError("Debes enviar al menos un registro de asistencia.");
        }

        const payload: BulkUpsertAttendancePayload = { classId, records, date };
        await this.attendanceRepository.bulkUpsertAttendance(payload, auth);
    }
}