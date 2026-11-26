import React, { useMemo, useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    FileBarChart2,
    GraduationCap,
    Megaphone,
    Plus,
    RefreshCw,
    ShieldAlert,
    Users,
} from "lucide-react";
import { usePrincipalDashboard } from "../../hooks/usePrincipalDashboard.ts";
import { MOCK_PRINCIPAL_DASHBOARD } from "../dashboard.mock.ts";
import type {
    AttendanceAlert,
    PrincipalDashboardData,
} from "../../types/types.ts";
import {formatDateParts} from "../../../../utils/utils.ts";
import {reverseName} from "../../../../../types";
import { EmptyPanel } from "../ui/EmptyPanel.tsx";
import {AlertItem} from "../ui/AlertItem.tsx";
import {KpiCard} from "../ui/KpiCard.tsx";
import {DashboardSkeleton} from "../ui/DashboardSkeleton.tsx";
import { isCourseFlagged, getAttendanceStatus, PASSING_AVERAGE } from "../../utils/utils.ts"
import { LuTrendingUp } from "react-icons/lu";

const USE_MOCK = false;

interface PrincipalDashboardLayoutProps {
    data?: PrincipalDashboardData;
}

export const PrincipalDashboardLayout: React.FC<PrincipalDashboardLayoutProps> = ({
                                                                                      data: propData,
                                                                                  }) => {
    const { loading, error, dashboard, refetch } = usePrincipalDashboard();
    const [courseFilter, setCourseFilter] = useState<"all" | "alerts">("all");

    const data = propData ?? (USE_MOCK ? MOCK_PRINCIPAL_DASHBOARD : dashboard);

    const handleCreateAnnouncement = () => {
        console.log("[Dashboard] Action: Create announcement");
        alert("Abrir modal: Crear comunicado");
    };

    const handleCreateCourse = () => {
        console.log("[Dashboard] Action: Create course");
        alert("Abrir modal: Crear curso");
    };

    const handleViewReports = () => {
        console.log("[Dashboard] Action: View reports");
        alert("Navegar a: Reportes");
    };

    const handleSelectStudentRisk = (student: AttendanceAlert) => {
        console.log("[Dashboard] Select student at risk:", student);
    };

    const summary = useMemo(() => {
        if (!data) {
            return { coursesWithAlerts: 0, coursesWithoutDirector: 0, upcomingCount: 0 };
        }
        return {
            coursesWithAlerts: data.courses_overview.filter(isCourseFlagged).length,
            coursesWithoutDirector: data.courses_overview.filter((c) => !c.director_name)
                .length,
            upcomingCount: data.upcoming_announcements.length,
        };
    }, [data]);

    const sortedCourses = useMemo(() => {
        if (!data) return [];
        const list =
            courseFilter === "alerts"
                ? data.courses_overview.filter(isCourseFlagged)
                : [...data.courses_overview];

        return list.sort((a, b) => {
            const aEmpty = a.students_count === 0 ? 1 : 0;
            const bEmpty = b.students_count === 0 ? 1 : 0;
            if (aEmpty !== bEmpty) return aEmpty - bEmpty;

            const aFlagged = isCourseFlagged(a) ? 0 : 1;
            const bFlagged = isCourseFlagged(b) ? 0 : 1;
            if (aFlagged !== bFlagged) return aFlagged - bFlagged;

            return a.course_name.localeCompare(b.course_name, "es", { numeric: true });
        });
    }, [data, courseFilter]);

    if (!USE_MOCK && !propData) {
        if (loading && !data) {
            return <DashboardSkeleton />;
        }

        if (error && !data) {
            return (
                <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-rose-200 bg-white p-8 text-center mt-10">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <AlertCircle className="h-6 w-6" />
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">
                        Error al cargar el dashboard
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{error}</p>
                    <button
                        type="button"
                        onClick={refetch}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#9757FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8440F5]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reintentar
                    </button>
                </div>
            );
        }
    }

    if (!data) return null;

    const hasErrorAlert = data.alerts.some((a) => a.severity === "error");

    return (
        <div className=" w-full space-y-3">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                    label="Estudiantes"
                    value={data.kpis.students.active}
                    subtext={`${data.kpis.students.total} registrados`}
                    icon={<GraduationCap className="h-30 w-30" />}
                />
                <KpiCard
                    label="Profesores"
                    value={data.kpis.teachers.active}
                    subtext={
                        data.kpis.teachers.without_classes > 0
                            ? `${data.kpis.teachers.without_classes} sin clases`
                            : `${data.kpis.teachers.total} activos`
                    }
                    highlightSubtext={data.kpis.teachers.without_classes > 0}
                    icon={<Users className="h-30 w-30" />}
                />
                <KpiCard
                    label="Cursos"
                    value={data.courses_overview.length}
                    subtext={
                        summary.coursesWithAlerts > 0
                            ? `${summary.coursesWithAlerts} con alerta`
                            : "Todos al día"
                    }
                    highlightSubtext={summary.coursesWithAlerts > 0}
                    icon={<BookOpen className="h-30 w-30" />}
                />
                <KpiCard
                    label="Promedio"
                    value={
                        data.school_average !== null
                            ? data.school_average.toFixed(2)
                            : "—"
                    }
                    subtext="Ponderado institucional"
                    icon={<LuTrendingUp className="h-30 w-30" />}
                    accent
                />
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                    hasErrorAlert
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-amber-50 text-amber-600"
                                }`}
                            >
                                <AlertTriangle className="h-4 w-4" />
                            </span>
                            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                Requieren atención
                            </h2>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            data.alerts.length === 0
                                ? "bg-slate-100 text-slate-600"
                                : hasErrorAlert
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                            >
                            {data.alerts.length}
                        </span>
                    </div>

                    {data.alerts.length === 0 ? (
                        <EmptyPanel
                            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            title="Todo al día"
                            description="No hay avisos operativos ni académicos pendientes."
                        />
                    ) : (
                        <ul className="space-y-2 overflow-auto max-h-96 no-scrollbar h-full">
                            {data.alerts.map((alertItem, idx) => (
                                <AlertItem
                                    key={`${alertItem.message}-${idx}`}
                                    alert={alertItem}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <ShieldAlert className="h-4 w-4" />
                            </span>
                            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                Estudiantes en riesgo
                            </h2>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {data.attendance_alerts.length}
                        </span>
                    </div>

                    {data.attendance_alerts.length === 0 ? (
                        <EmptyPanel
                            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            title="Sin alertas de asistencia"
                            description="Ningún estudiante supera el umbral de inasistencias o retardos."
                        />
                    ) : (
                        <ul className="space-y-2 overflow-auto max-h-96 no-scrollbar h-full">
                            {data.attendance_alerts.map((student) => (
                                <li key={`${student.course_id}-${student.student_id}`}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectStudentRisk(student)}
                                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                            student.is_red_alert
                                                ? "bg-rose-50/80 hover:bg-rose-50"
                                                : "bg-slate-50/70 hover:bg-slate-100/80"
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {reverseName({
                                                    firstLastName: student.student_first_last_name,
                                                    secondLastName: student.student_second_last_name,
                                                    firstName: student.student_first_name,
                                                    middleName: student.student_middle_name,
                                                })}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Curso {student.course_name}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1.5 text-xs">
                                <span className="rounded-md bg-rose-100/70 px-2 py-0.5 font-medium text-rose-700">
                                    {student.total_absences} fallas
                                </span>
                                            {student.total_lates > 0 && (
                                                <span className="hidden rounded-md bg-amber-100/70 px-2 py-0.5 font-medium text-amber-700 sm:inline">
                                        {student.total_lates} tardes
                                    </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 3. PRÓXIMOS COMUNICADOS */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 md:col-span-2 lg:col-span-1">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-shadow text-primary-darker">
                                <Megaphone className="h-4 w-4" />
                            </span>
                            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                Próximos comunicados
                            </h2>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {data.upcoming_announcements.length}
                        </span>
                    </div>

                    {data.upcoming_announcements.length === 0 ? (
                        <EmptyPanel
                            icon={<Calendar className="h-5 w-5 text-slate-400" />}
                            title="Sin comunicados programados"
                            description="Los avisos publicados o agendados aparecerán aquí."
                            actionLabel="Crear comunicado"
                            onAction={handleCreateAnnouncement}
                        />
                    ) : (() => {
                        const featured = data.upcoming_announcements[0];
                        const featuredDate = formatDateParts(featured.scheduled_for);

                        return (
                            <ul className="no-scrollbar h-full max-h-96 overflow-auto">
                                <li className="sticky top-0 left-0 z-10 bg-white pb-2">
                                    <div className="relative flex h-38 w-full flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-darker p-4 text-white">
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-primary-shadow/15"
                                        />
                                        <Megaphone
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -right-2 bottom-2 h-24 w-24 -rotate-12 text-white/10"
                                        />

                                        <div className="relative z-10 flex items-center justify-between gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium capitalize backdrop-blur-xs">
                                                <Calendar className="h-3 w-3" />
                                                Próximo · {featured.type}
                                            </span>
                                            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium">
                                                {featuredDate.weekday} {featuredDate.dayNum}{" "}
                                                {featuredDate.month.slice(0, -1)}
                                            </span>
                                        </div>

                                        <div className="relative z-10 min-w-0 pr-10">
                                            <p className="line-clamp-2 text-base leading-snug font-semibold">
                                                {featured.title}
                                            </p>
                                            <p className="mt-1 text-xs text-white/80">
                                                {featured.status === "published"
                                                    ? "Publicado para la comunidad"
                                                    : "Programado para envío automático"}
                                            </p>
                                        </div>
                                    </div>
                                </li>

                                {data.upcoming_announcements.map((item) => {
                                    const { dayNum, month, weekday } = formatDateParts(item.scheduled_for);

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                <div className="flex w-[55px] shrink-0 flex-col items-center rounded-xl border border-primary/20 bg-primary-shadow py-1 text-primary-darker">
                                                    <span className="text-xs font-medium">{weekday}</span>
                                                    <span className="-my-1.5 text-lg font-medium">{dayNum}</span>
                                                    <span className="text-xs font-medium">
                                                        {month.slice(0, -1)}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-slate-800">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                        <span className="capitalize">{item.type}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                                    item.status === "published"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-primary-shadow text-primary-darker"
                                                }`}
                                            >
                                                {item.status === "published" ? "Publicado" : "Agendado"}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    })()}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-8">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Cursos
                            </h2>
                            <p className="text-xs text-slate-500">
                                Asistencia, promedio del periodo y seguimiento convivencial
                            </p>
                        </div>

                        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setCourseFilter("all")}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
                                    courseFilter === "all"
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Todos ({data.courses_overview.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setCourseFilter("alerts")}
                                className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
                                    courseFilter === "alerts"
                                        ? "bg-white text-rose-700 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Con alertas ({summary.coursesWithAlerts})
                            </button>
                        </div>
                    </div>

                    {sortedCourses.length === 0 ? (
                        <EmptyPanel
                            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            title={
                                courseFilter === "alerts"
                                    ? "Ningún curso requiere revisión"
                                    : "No hay cursos registrados"
                            }
                            description={
                                courseFilter === "alerts"
                                    ? "Todos los cursos con estudiantes cumplen las metas de asistencia y promedio."
                                    : "Crea el primer curso para comenzar a gestionar estudiantes y clases."
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-2.5 md:hidden">
                                {sortedCourses.map((course) => {
                                    const att = getAttendanceStatus(course);
                                    const isEmpty = course.students_count === 0;
                                    return (
                                        <div
                                            key={course.course_id}
                                            className="w-full rounded-xl border border-slate-200 p-3.5"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-bold text-slate-900">
                                                    Curso {course.course_name}
                                                </span>
                                                {course.monitorings_count > 0 && (
                                                    <span className="rounded-full bg-primary-shadow px-2 py-0.5 text-[11px] font-semibold text-primary-darker">
                                            {course.monitorings_count} seg.
                                        </span>
                                                )}
                                            </div>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                Dir.{" "}
                                                {course.director_name ? (
                                                    <span className="capitalize">
                                                        {course.director_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-rose-600">
                                                        Sin asignar
                                                    </span>
                                                )}
                                            </p>

                                            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-xs">
                                                <div>
                                                    <span className="block text-[11px] text-slate-400">
                                                        Estudiantes
                                                    </span>
                                                    <span className="font-semibold text-slate-800">
                                                        {course.students_count}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[11px] text-slate-400">
                                                        Asistencia
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 font-semibold ${att.text}`}
                                                    >
                                                    <span
                                                            className={`h-2 w-2 rounded-full ${att.dot}`}
                                                        />
                                                        {att.label}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[11px] text-slate-400">
                                                        Promedio
                                                    </span>
                                                    {isEmpty || course.period_average === null ? (
                                                        <span className="font-semibold text-slate-400">
                                                        —
                                                    </span>
                                                    ) : (
                                                        <span
                                                            className={`font-semibold ${
                                                                course.period_average < PASSING_AVERAGE
                                                                    ? "text-rose-600"
                                                                    : "text-slate-800"
                                                            }`}
                                                        >
                                                            {course.period_average.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="hidden max-h-82 no-scrollbar h-full overflow-x-auto md:block">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead>
                                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                                        <th className="py-2.5 pr-3">Curso</th>
                                        <th className="px-3 py-2.5 text-center">Estudiantes</th>
                                        <th className="px-3 py-2.5">Asistencia</th>
                                        <th className="px-3 py-2.5 text-center">Promedio</th>
                                        <th className="px-3 py-2.5 text-center">Seguimientos</th>
                                        <th className="px-3 py-2.5">Director</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {sortedCourses.map((course) => {
                                        const att = getAttendanceStatus(course);
                                        const isEmpty = course.students_count === 0;
                                        return (
                                            <tr
                                                key={course.course_id}
                                                className="transition hover:bg-primary-shadow/30"
                                            >
                                                <td className="py-3 pr-3 font-semibold text-slate-900">
                                                    {course.course_name}
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-700">
                                                    {course.students_count}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-2 font-medium ${att.text}`}
                                                    >
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${att.dot}`}
                                                    />
                                                        {att.label}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center font-medium">
                                                    {isEmpty || course.period_average === null ? (
                                                        <span className="text-slate-400">—</span>
                                                    ) : (
                                                        <span
                                                            className={
                                                                course.period_average < PASSING_AVERAGE
                                                                    ? "text-rose-600"
                                                                    : "text-slate-800"
                                                            }
                                                        >
                                                            {course.period_average.toFixed(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {course.monitorings_count > 0 ? (
                                                        <span className="inline-flex min-w-6 justify-center rounded-full bg-primary-shadow px-2 py-1 text-xs font-semibold text-primary-darker">
                                                            {course.monitorings_count}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">0</span>
                                                    )}
                                                </td>
                                                <td className="max-w-[160px] truncate px-3 py-3 text-slate-600">
                                                    {course.director_name ? (
                                                        <span className="capitalize">
                                                    {course.director_name}
                                                </span>
                                                    ) : (
                                                        <span className="text-rose-600">
                                                    Sin asignar
                                                </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions & Operational Summary */}
                <aside className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 xl:col-span-4">
                    <div>
                        <h2 className="mb-3.5 text-base font-semibold text-slate-900">
                            Acciones rápidas
                        </h2>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
                            <button
                                type="button"
                                onClick={handleCreateAnnouncement}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-darker xl:justify-start"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span>Crear comunicado</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCreateCourse}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-shadow/40 px-4 py-2.5 text-sm font-semibold text-primary-darker transition hover:bg-primary-shadow xl:justify-start"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span>Crear curso</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleViewReports}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 xl:justify-start"
                            >
                                <FileBarChart2 className="h-4 w-4 shrink-0 text-slate-500" />
                                <span>Ver reportes</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Resumen operativo
                        </p>
                        <dl className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-slate-600">Cursos con alertas</dt>
                                <dd
                                    className={`font-semibold ${
                                        summary.coursesWithAlerts > 0
                                            ? "text-rose-600"
                                            : "text-slate-900"
                                    }`}
                                >
                                    {summary.coursesWithAlerts}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-slate-600">Cursos sin director</dt>
                                <dd
                                    className={`font-semibold ${
                                        summary.coursesWithoutDirector > 0
                                            ? "text-rose-600"
                                            : "text-slate-900"
                                    }`}
                                >
                                    {summary.coursesWithoutDirector}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-slate-600">Profesores sin clases</dt>
                                <dd
                                    className={`font-semibold ${
                                        data.kpis.teachers.without_classes > 0
                                            ? "text-amber-600"
                                            : "text-slate-900"
                                    }`}
                                >
                                    {data.kpis.teachers.without_classes}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt className="text-slate-600">Comunicados próximos</dt>
                                <dd className="font-semibold text-slate-900">
                                    {summary.upcomingCount}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </section>
        </div>
    );
};