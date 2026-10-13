import type { ICumulativeRepository } from "../domain/ICumulativeRepository.js";
import type {
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary,
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

            return {
                student_id: g.student_id,
                student_first_name: g.student_first_name,
                student_middle_name: g.student_middle_name,
                student_first_last_name: g.student_first_last_name,
                student_second_last_name: g.student_second_last_name,
                period_average: g.period_average,
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