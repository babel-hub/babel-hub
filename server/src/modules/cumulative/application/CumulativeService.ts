import type { ICumulativeRepository } from "../domain/ICumulativeRepository.js";
import type {
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary, GetCourseTrendPayload,
    GetCumulativeRecordPayload
} from "../domain/Cumulative.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";

export class CumulativeService {
    constructor(private readonly cumulativeRepository: ICumulativeRepository) {}

    private validate(payload: GetCumulativeRecordPayload): void {
        if (!payload.courseId || !payload.periodId) {
            throw new ValidationError("El id del curso o del periodo son inválidos");
        }
    }

    async getCoursePeriodTrend(
        payload: GetCourseTrendPayload,
        authUser: AuthUser
    ): Promise<CoursePeriodTrend[]> {
        const auth = requireAuth(authUser);
        if (!payload.courseId) throw new ValidationError("El ID del curso es obligatorio");
        if (!payload.currentPeriodId) throw new ValidationError("El ID del periodo es obligatorio");

        return this.cumulativeRepository.getCoursePeriodTrend(payload, auth);
    }

    async getCumulativeSummary(
        payload: GetCumulativeRecordPayload,
        authUser: AuthUser
    ): Promise<CumulativeSummary[]> {
        const auth = requireAuth(authUser);
        this.validate(payload);

        const [grades, attendance] = await Promise.all([
            this.cumulativeRepository.getCumulativeGrades(payload, auth),
            this.cumulativeRepository.getCumulativeAttendance(payload, auth),
        ]);

        const attendanceByStudent = new Map(
            attendance.map(a => [a.student_id, a])
        );

        return grades.map(g => {
            const att = attendanceByStudent.get(g.student_id);
            const present = att?.present ?? 0;
            const absent  = att?.absent  ?? 0;
            const late    = att?.late    ?? 0;
            const excused = att?.excused ?? 0;
            const total   = present + absent + late + excused;

            const attendance_rate = total > 0
                ? Math.round((present / total) * 100)
                : 0;

            const subjects = g.subjects ?? [];
            const distinctScales = new Set(subjects.map(s => s.scale_id));

            if (distinctScales.size > 1) {
                console.error(
                    `[DATA INTEGRITY] Student ${g.student_id} has subjects on mixed scales, this are the scales:`,
                    [...distinctScales],
                );
            }

            const scale_id = subjects[0]?.scale_id ?? null;

            return {
                student_id: g.student_id,
                student_first_name: g.student_first_name,
                student_middle_name: g.student_middle_name,
                student_first_last_name: g.student_first_last_name,
                student_second_last_name: g.student_second_last_name,
                period_average: g.period_average,
                scale_id,
                attendance_rate,
                total_absences: absent,
                attendance: { present, absent, late, excused },
            };
        });
    }

    async getCumulativeGrades(
        payload: GetCumulativeRecordPayload,
        authUser: AuthUser
    ): Promise<CumulativeGrades[]> {
        const auth = requireAuth(authUser);
        this.validate(payload);
        return this.cumulativeRepository.getCumulativeGrades(payload, auth);
    }

    async getCumulativeAttendance(
        payload: GetCumulativeRecordPayload,
        authUser: AuthUser
    ): Promise<CumulativeAttendance[]> {
        const auth = requireAuth(authUser);
        this.validate(payload);
        return this.cumulativeRepository.getCumulativeAttendance(payload, auth);
    }
}