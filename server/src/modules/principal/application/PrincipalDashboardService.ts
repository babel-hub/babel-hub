import type { StudentService } from "../../student/application/StudentService.js";
import type { TeacherServices } from "../../teacher/application/TeacherServices.js";
import type { CoexistenceService } from "../../coexistence/application/CoexistenceService.js";
import type { AnnouncementService } from "../../announcements/application/AnnouncementService.js";
import type { AttendanceService } from "../../attendance/application/AttendanceService.js";
import type { CumulativeService } from "../../cumulative/application/CumulativeService.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { ForbiddenError } from "../../errors/domain/CustomErrors.js";
import type { CourseOverview } from "../../cumulative/domain/Cumulative.types.js";
import type { Alert } from "../domain/Principal.types.js";

export class PrincipalDashboardService {
    constructor(
        private readonly studentService: StudentService,
        private readonly teacherService: TeacherServices,
        private readonly coexistenceService: CoexistenceService,
        private readonly announcementService: AnnouncementService,
        private readonly attendanceService: AttendanceService,
        private readonly cumulativeService: CumulativeService,
    ) {}

    async getDashboard(authUser: AuthUser) {
        const auth = requireAuth(authUser);
        if (auth.userRole !== 'principal' && auth.userRole !== 'admin') {
            throw new ForbiddenError("Solo el director puede acceder");
        }

        const [
            studentStats,
            teacherStats,
            coexistenceStats,
            upcomingAnnouncements,
            attendanceAlerts,
            coursesOverview,
        ] = await Promise.all([
            this.studentService.getDashboardStats(authUser),
            this.teacherService.getDashboardStats(authUser),
            this.coexistenceService.getDashboardStats(authUser),
            this.announcementService.getUpcomingAnnouncements(3, authUser),
            this.attendanceService.getAttendanceAlerts(6, authUser),
            this.cumulativeService.getCoursesOverview(authUser),
        ]);

        return {
            kpis: { students: studentStats, teachers: teacherStats },
            alerts: this.buildAlerts(studentStats, teacherStats, coexistenceStats, coursesOverview),
            upcoming_announcements: upcomingAnnouncements,
            attendance_alerts: attendanceAlerts,
            courses_overview: coursesOverview,
            school_average: this.computeWeightedAverage(coursesOverview),
        };
    }

    private buildAlerts(
        studentStats: { total: number; active: number },
        teacherStats: { total: number; active: number; without_classes: number },
        coexistenceStats: { unpublished_infractions: number; stale_monitorings: number },
        coursesOverview: CourseOverview[],
    ): Alert[] {
        const alerts: Alert[] = [];

        const withoutDirector = coursesOverview.filter(c => !c.director_name).length;
        if (withoutDirector > 0) {
            alerts.push({
                severity: "error",
                message: `${withoutDirector} curso${withoutDirector > 1 ? "s" : ""} sin director asignado`,
                count: withoutDirector,
            });
        }

        if (teacherStats.without_classes > 0) {
            alerts.push({
                severity: "warning",
                message: `${teacherStats.without_classes} profesor${teacherStats.without_classes > 1 ? "es" : ""} sin clases asignadas`,
                count: teacherStats.without_classes,
            });
        }

        if (coexistenceStats.unpublished_infractions > 0) {
            alerts.push({
                severity: "warning",
                message: `${coexistenceStats.unpublished_infractions} infraccion${coexistenceStats.unpublished_infractions > 1 ? "es" : ""} sin publicar al acudiente`,
                count: coexistenceStats.unpublished_infractions,
            });
        }

        if (coexistenceStats.stale_monitorings > 0) {
            alerts.push({
                severity: "warning",
                message: `${coexistenceStats.stale_monitorings} monitoreo${coexistenceStats.stale_monitorings > 1 ? "s" : ""} sin seguimiento hace +7 días`,
                count: coexistenceStats.stale_monitorings,
            });
        }

        const problematicCourses = coursesOverview.filter(
            c => c.students_count > 0 && (
                c.attendance_rate < 80 ||
                (c.period_average !== null && c.period_average < 3.5)
            )
        );

        if (problematicCourses.length > 0) {
            alerts.push({
                severity: "error",
                message: `${problematicCourses.length} curso${problematicCourses.length > 1 ? "s" : ""} requiere${problematicCourses.length === 1 ? "" : "n"} revisión`,
                count: problematicCourses.length,
            });
        }

        return alerts;
    }

    private computeWeightedAverage(courses: CourseOverview[]): number | null {
        const valid = courses.filter(c => c.period_average !== null && c.students_count > 0);
        if (valid.length === 0) return null;

        const totalStudents = valid.reduce((sum, c) => sum + c.students_count, 0);
        if (totalStudents === 0) return null;

        const weightedSum = valid.reduce(
            (sum, c) => sum + (c.period_average! * c.students_count),
            0
        );

        return Math.round((weightedSum / totalStudents) * 100) / 100;
    }
}