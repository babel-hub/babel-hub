import type { ICumulativeRepository } from "../domain/ICumulativeRepository.js";
import type {
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary, GetCourseTrendPayload,
    GetCumulativeRecordPayload, ReportCard, ReportCardArea, ReportStudentRow
} from "../domain/Cumulative.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import {NotFoundError, ValidationError} from "../../errors/domain/CustomErrors.js";

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

    async getStudentsForReports(courseId: string, authUser: AuthUser): Promise<ReportStudentRow[]> {
        const auth = requireAuth(authUser);
        if (!courseId) throw new ValidationError("El ID del curso es obligatorio");

        return this.cumulativeRepository.getStudentsForReports(courseId, auth);
    }

    async generateStudentReportCard(studentId: string, authUser: AuthUser): Promise<ReportCard> {
        if (!studentId) throw new ValidationError("El id del estudiante es inválido");
        const auth = requireAuth(authUser);
        const rows = await this.cumulativeRepository.getStudentReportCardData(studentId, auth);
        if (!rows.length) throw new NotFoundError("No hay datos para el boletín");

        const studentInfo = await this.cumulativeRepository.getStudentInfo(studentId, auth);

        const areasMap = new Map<string, ReportCardArea>();

        rows.forEach(row => {
            if (!areasMap.has(row.area_id)) {
                areasMap.set(row.area_id, {
                    area_id: row.area_id,
                    area_name: row.area_name,
                    subjects: []
                });
            }
            const area = areasMap.get(row.area_id)!;

            let subject = area.subjects.find(s => s.subject_id === row.subject_id);
            if (!subject) {
                subject = {
                    subject_id: row.subject_id,
                    subject_name: row.subject_name,
                    weekly_hours: 0,
                    periods: [],
                    total_absences: 0,
                    final_average: null
                };
                area.subjects.push(subject);
            }

            const absences = Number(row.absences) || 0;

            subject.periods.push({
                period_id: row.period_id,
                period_name: row.period_name,
                order: 0,
                average: row.period_average,
                recovery: null,
                absences: absences
            });

            subject.total_absences += absences;
        });


        const areas = Array.from(areasMap.values());

        // console.log(JSON.stringify(areas, null, 2));

        areas.forEach(area => {
            area.subjects.forEach(sub => {
                const validPeriods = sub.periods.filter(p => p.average !== null);
                if (validPeriods.length > 0) {
                    const sum = validPeriods.reduce((acc, p) => acc + p.average!, 0);
                    sub.final_average = Number((sum / validPeriods.length).toFixed(2));
                }
            });
        });

        return {
            school_name: studentInfo.school_name,
            school_code: studentInfo.school_code,
            school_logo_url: studentInfo.school_logo_url || null,
            school_year: studentInfo.school_year,
            director_name: studentInfo.director_name,
            student: {
                student_id: studentInfo.student_id,
                first_name: studentInfo.first_name,
                middle_name: studentInfo.middle_name,
                first_last_name: studentInfo.first_last_name,
                second_last_name: studentInfo.second_last_name,
                course_name: studentInfo.course_name,
                enrollment_code: studentInfo.enrollment_code,
            },
            periods: studentInfo.periods,
            areas: Array.from(areasMap.values()),
            course_average: studentInfo.course_average,
            student_average: studentInfo.student_average,
            rank: studentInfo.rank,
            generated_at: new Date().toISOString(),
        };
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