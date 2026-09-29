import type { IAttendanceRepository } from "../domain/IAttendanceRepository.js";
import type {
    AttendanceSummary,
    BulkRecords, CalendarAttendance,
    ClassAttendance, CourseAttendance,
    CourseDailyAttendance, DailyAttendance
} from "../domain/Attendance.types.js";
import { UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";

export class AttendanceService {
    constructor(private readonly attendanceRepository : IAttendanceRepository) {}

    async getDailyClassAttendance(classId: string, schoolId: string, date:string, isActive:boolean): Promise<ClassAttendance[]> {
        if (!schoolId) throw new UnauthorizedError('Credenciales del usuario (master) invalidas');
        if (!date || !classId) throw new ValidationError('La informacion suministrada esta incompleta o es erronea');

        return this.attendanceRepository.getDailyClassAttendance(classId, schoolId, date, isActive);
    }

    async getDailyCourseAttendance(courseId: string, schoolId: string, date: string, isActive: boolean): Promise<CourseDailyAttendance[]> {
        if (!schoolId) throw new UnauthorizedError('Credenciales del usuario (master) invalidas');
        if (!date || !courseId) throw new ValidationError('La informacion suministrada esta incompleta o es erronea');

        return this.attendanceRepository.getDailyCourseAttendance(courseId, schoolId, date, isActive);
    }

    async getAttendanceSummary(schoolId: string, today: string, startDate: string, endDate: string, isActive: boolean): Promise<AttendanceSummary[]> {
        if (!schoolId) throw new UnauthorizedError('Credenciales del usuario (master) invalidas');
        if (!startDate || !endDate || !today) throw new ValidationError("La fecha es obligatoria");

        return this.attendanceRepository.getAttendanceSummary(schoolId, today,startDate, endDate, isActive);
    }

    async getCalendarAttendance(studentId: string, startDate: string, endDate: string): Promise<CalendarAttendance[]> {
        if (!studentId) throw new ValidationError("Credenciales del estudiante son invalidas");
        if (!startDate || !endDate) throw new ValidationError("La fecha es obligatoria");

        return this.attendanceRepository.getCalendarAttendance(studentId, startDate, endDate);
    }

    async getClassAttendance(courseId: string, classId: string, startDate: string, endDate: string): Promise<CourseAttendance[]> {
        if (!classId || !courseId) throw new ValidationError("Credenciales de la clase son invalidas");
        if (!startDate || !endDate) throw new ValidationError("La fecha es obligatoria");

        return this.attendanceRepository.getClassAttendance(courseId, classId, startDate, endDate);
    }

    async bulkUpsertAttendance(classId: string, records: BulkRecords[], date: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        if (!userId || !userRole || !userSchoolId) throw new UnauthorizedError('Credenciales del usuario (master) invalidas');
        if (!date || !classId) throw new ValidationError('La informacion suministrada esta incompleta o es erronea');
        if (!Array.isArray(records) || records.length === 0) throw new ValidationError("Debes enviar al menos un registro de asistencia");

        return await this.attendanceRepository.bulkUpsertAttendance(classId, records, date, userId, userRole, userSchoolId);
    }
}