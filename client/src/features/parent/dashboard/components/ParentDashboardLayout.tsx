import React, { useMemo, useState } from "react";
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    GraduationCap,
    Megaphone,
    MessageSquare,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import { MOCK_PARENT_DASHBOARD } from "../types/test.mock.ts";
import type {
    AttendanceDayLog,
    AttendanceDayStatus,
    ObservadorEntry,
    ParentAnnouncement,
    ParentDashboardData,
    UpcomingAssignment,
} from "../types/types.ts";

interface ParentDashboardLayoutProps {
    data?: ParentDashboardData;
}

const PASSING_GRADE = 3.5;
const MAX_GRADE = 5.0;

function formatShortDate(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
    });
}

function formatDayPill(isoDate: string): { weekday: string; day: string } {
    const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return { weekday: "", day: isoDate };
    return {
        weekday: date
            .toLocaleDateString("es-CO", { weekday: "short" })
            .replace(".", ""),
        day: String(date.getDate()),
    };
}

function formatAnnouncementDate(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return { weekday: "", dayNum: "", month: "" };
    }
    return {
        weekday: date
            .toLocaleDateString("es-CO", { weekday: "short" })
            .replace(".", ""),
        dayNum: String(date.getDate()),
        month: date
            .toLocaleDateString("es-CO", { month: "short" })
            .replace(".", ""),
    };
}

const ATTENDANCE_META: Record<
    AttendanceDayStatus,
    { label: string; dot: string; badge: string }
> = {
    present: {
        label: "Asistió",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700",
    },
    late: {
        label: "Retardo",
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700",
    },
    absent: {
        label: "Falta",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700",
    },
    excused: {
        label: "Excusa",
        dot: "bg-sky-500",
        badge: "bg-sky-50 text-sky-700",
    },
};

export const ParentDashboardLayout: React.FC<ParentDashboardLayoutProps> = ({
                                                                                data: propData,
                                                                            }) => {
    const data = propData ?? MOCK_PARENT_DASHBOARD;

    const [selectedChildId, setSelectedChildId] = useState<string>(
        data.children[0]?.student_id ?? ""
    );
    const [subjectFilter, setSubjectFilter] = useState<"all" | "risk">("all");

    const child = useMemo(
        () =>
            data.children.find((c) => c.student_id === selectedChildId) ??
            data.children[0],
        [data.children, selectedChildId]
    );

    const subjectsAtRiskCount = useMemo(() => {
        if (!child) return 0;
        return child.subjects.filter(
            (s) => s.current_grade !== null && s.current_grade < PASSING_GRADE
        ).length;
    }, [child]);

    const filteredSubjects = useMemo(() => {
        if (!child) return [];
        const list =
            subjectFilter === "risk"
                ? child.subjects.filter(
                    (s) =>
                        s.current_grade !== null &&
                        s.current_grade < PASSING_GRADE
                )
                : [...child.subjects];

        // Lowest grades first so parents spot what needs help immediately
        return list.sort((a, b) => (a.current_grade ?? 99) - (b.current_grade ?? 99));
    }, [child, subjectFilter]);

    const pendingAssignmentsCount = useMemo(
        () =>
            child?.upcoming_assignments.filter((a) => a.status === "pending")
                .length ?? 0,
        [child]
    );

    // --- Test handlers (swap with navigation / modals later) ---
    const handleOpenObservador = (entry: ObservadorEntry) => {
        console.log("[ParentDashboard] Open observador entry:", entry);
        alert(
            entry.has_monitoring
                ? `Abrir seguimiento (${entry.infraction_type}) - ${entry.article_label}`
                : `Ver detalle de observación (${entry.infraction_type})`
        );
    };

    const handleOpenAnnouncement = (ann: ParentAnnouncement) => {
        console.log("[ParentDashboard] Open announcement:", ann);
        alert(`Comunicado: ${ann.title}\n\n${ann.summary}`);
    };

    const handleOpenAssignment = (asg: UpcomingAssignment) => {
        console.log("[ParentDashboard] Open assignment:", asg);
        alert(`${asg.subject_name}: ${asg.title} (Entrega: ${formatShortDate(asg.due_date)})`);
    };

    const handleOpenAttendanceIncident = (incident: AttendanceDayLog) => {
        console.log("[ParentDashboard] Open attendance incident:", incident);
        alert(
            `${ATTENDANCE_META[incident.status].label} · ${formatShortDate(incident.date)}\n${incident.note ?? ""}`
        );
    };

    if (!child) return null;

    const featuredAnnouncement = child.announcements[0];
    const featuredDate = featuredAnnouncement
        ? formatAnnouncementDate(featuredAnnouncement.published_at)
        : null;

    return (
        <div className="w-full space-y-3">
            <header className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-shadow text-primary-darker">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                                {child.full_name}
                            </h1>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 sm:text-sm">
                                <span className="font-medium text-primary-darker">
                                    Curso {child.course_name}
                                </span>
                                <span>·</span>
                                <span>{child.period_name}</span>
                                {child.director_name && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            Dir. grupo:{" "}
                                            <span className="capitalize text-slate-700">
                                                {child.director_name}
                                            </span>
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Multi-child switcher */}
                    {data.children.length > 1 && (
                        <div className="inline-flex self-start rounded-xl bg-slate-100 p-1 text-xs font-medium md:self-auto">
                            {data.children.map((item) => {
                                const active = item.student_id === child.student_id;
                                return (
                                    <button
                                        key={item.student_id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedChildId(item.student_id);
                                            setSubjectFilter("all");
                                        }}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
                                            active
                                                ? "bg-primary text-white"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {item.full_name.split(" ")[0]} · {item.course_name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Inline contextual status strip (replaces bare KPI boxes) */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4">
                    <StatusPill
                        label="Promedio actual"
                        value={
                            child.period_average !== null
                                ? `${child.period_average.toFixed(2)} / ${MAX_GRADE.toFixed(1)}`
                                : "Sin notas"
                        }
                        tone={
                            child.period_average !== null &&
                            child.period_average < PASSING_GRADE
                                ? "danger"
                                : "primary"
                        }
                    />
                    <StatusPill
                        label="Asistencia"
                        value={`${child.attendance.rate.toFixed(1)}% · ${child.attendance.total_absences} ${
                            child.attendance.total_absences === 1 ? "falta" : "fallas"
                        }`}
                        tone={
                            child.attendance.rate < 85
                                ? "warning"
                                : "success"
                        }
                    />
                    <StatusPill
                        label="Materias en riesgo"
                        value={
                            subjectsAtRiskCount > 0
                                ? `${subjectsAtRiskCount} por debajo de ${PASSING_GRADE}`
                                : "Todas aprobadas"
                        }
                        tone={subjectsAtRiskCount > 0 ? "danger" : "success"}
                    />
                    <StatusPill
                        label="Observador"
                        value={
                            child.observador.length > 0
                                ? `${child.observador.length} ${
                                    child.observador.length === 1
                                        ? "registro"
                                        : "registros"
                                }`
                                : "Sin novedades"
                        }
                        tone={child.observador.length > 0 ? "warning" : "success"}
                    />
                </div>
            </header>

            {/* MAIN 2-COLUMN RESPONSIVE GRID */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* LEFT COLUMN: GRADES + OBSERVADOR */}
                <div className="space-y-4 lg:col-span-7">
                    {/* 1. GRADES BY SUBJECT */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-shadow text-primary-darker">
                                    <BookOpen className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Calificaciones por materia
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Nota acumulada del periodo y última actividad calificada
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setSubjectFilter("all")}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1 transition ${
                                        subjectFilter === "all"
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Todas ({child.subjects.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSubjectFilter("risk")}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1 transition ${
                                        subjectFilter === "risk"
                                            ? "bg-white text-rose-700 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    En riesgo ({subjectsAtRiskCount})
                                </button>
                            </div>
                        </div>

                        {filteredSubjects.length === 0 ? (
                            <EmptyState
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                title="Sin materias en riesgo"
                                description="Todas las asignaturas superan la nota mínima aprobatoria."
                            />
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filteredSubjects.map((subject) => {
                                    const isLow =
                                        subject.current_grade !== null &&
                                        subject.current_grade < PASSING_GRADE;
                                    const percent =
                                        subject.current_grade !== null
                                            ? Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    (subject.current_grade / MAX_GRADE) * 100
                                                )
                                            )
                                            : 0;

                                    return (
                                        <li
                                            key={subject.subject_id}
                                            className="py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {subject.subject_name}
                                                        </p>
                                                        {isLow && (
                                                            <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                                                                En riesgo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 text-xs capitalize text-slate-500">
                                                        Prof. {subject.teacher_name}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold ${
                                                        subject.current_grade === null
                                                            ? "bg-slate-100 text-slate-400"
                                                            : isLow
                                                                ? "bg-rose-50 text-rose-700"
                                                                : "bg-primary-shadow/60 text-primary-darker"
                                                    }`}
                                                >
                                                    {subject.current_grade !== null
                                                        ? subject.current_grade.toFixed(1)
                                                        : "—"}
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isLow ? "bg-rose-500" : "bg-primary"
                                                    }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                            {/* Last graded activity */}
                                            {subject.last_activity_title && (
                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                                    <span className="truncate">
                                                        Última nota:{" "}
                                                        <span className="font-medium text-slate-700">
                                                            {subject.last_activity_title}
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 font-medium text-slate-600">
                                                        {subject.last_activity_grade?.toFixed(1)}
                                                        {subject.last_activity_date
                                                            ? ` · ${formatShortDate(subject.last_activity_date)}`
                                                            : ""}
                                                    </span>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* 2. OBSERVADOR DEL ESTUDIANTE */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Observador y convivencia
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Anotaciones publicadas y seguimientos activos
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                {child.observador.length}
                            </span>
                        </div>

                        {child.observador.length === 0 ? (
                            <EmptyState
                                icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
                                title="Sin anotaciones en el observador"
                                description="No hay llamados de atención ni seguimientos registrados en este periodo."
                            />
                        ) : (
                            <ul className="space-y-3">
                                {child.observador.map((entry) => {
                                    const isSevere = entry.infraction_type !== "Tipo I";
                                    return (
                                        <li
                                            key={entry.id}
                                            className="rounded-xl border border-slate-200 p-3.5 transition hover:border-primary/40"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                            isSevere
                                                                ? "bg-rose-50 text-rose-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {entry.infraction_type}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {entry.article_label}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {formatShortDate(entry.occurred_at)} ·{" "}
                                                    {entry.location_context}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-slate-700">
                                                {entry.description}
                                            </p>

                                            <p className="mt-1.5 text-xs text-slate-400">
                                                Reportado por {entry.reported_by}
                                            </p>

                                            {entry.has_monitoring &&
                                                entry.latest_monitoring_note && (
                                                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary-shadow/40 p-2.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-darker">
                                                                <MessageSquare className="h-3.5 w-3.5" />
                                                                Seguimiento activo (
                                                                {entry.monitoring_messages_count}{" "}
                                                                {entry.monitoring_messages_count === 1
                                                                    ? "nota"
                                                                    : "notas"}
                                                                )
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenObservador(entry)
                                                                }
                                                                className="cursor-pointer text-xs font-semibold text-primary-darker hover:underline"
                                                            >
                                                                Ver bitácora
                                                            </button>
                                                        </div>
                                                        <p className="mt-1 text-xs text-slate-700">
                                                            {entry.latest_monitoring_note}
                                                        </p>
                                                    </div>
                                                )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: ATTENDANCE + ASSIGNMENTS + ANNOUNCEMENTS */}
                <div className="space-y-4 lg:col-span-5">
                    {/* 3. ATTENDANCE */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <UserCheck className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Asistencia reciente
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Últimos 7 días hábiles y novedades
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                                {child.attendance.rate.toFixed(1)}%
                            </span>
                        </div>

                        {/* 7-day visual strip */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {child.attendance.recent_days.map((day) => {
                                const { weekday, day: dayNum } = formatDayPill(day.date);
                                const meta = ATTENDANCE_META[day.status];
                                return (
                                    <div
                                        key={day.date}
                                        title={`${formatShortDate(day.date)} · ${meta.label}${day.note ? ` — ${day.note}` : ""}`}
                                        className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/70 py-2"
                                    >
                                        <span className="text-[10px] font-medium capitalize text-slate-400">
                                            {weekday}
                                        </span>
                                        <span className="my-0.5 text-xs font-bold text-slate-800">
                                            {dayNum}
                                        </span>
                                        <span
                                            className={`h-2 w-2 rounded-full ${meta.dot}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Breakdown counters */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg bg-rose-50/70 py-1.5">
                                <span className="block font-bold text-rose-700">
                                    {child.attendance.total_absences}
                                </span>
                                <span className="text-[11px] text-rose-600">Fallas</span>
                            </div>
                            <div className="rounded-lg bg-amber-50/70 py-1.5">
                                <span className="block font-bold text-amber-700">
                                    {child.attendance.total_lates}
                                </span>
                                <span className="text-[11px] text-amber-600">Retardos</span>
                            </div>
                            <div className="rounded-lg bg-sky-50/70 py-1.5">
                                <span className="block font-bold text-sky-700">
                                    {child.attendance.total_excused}
                                </span>
                                <span className="text-[11px] text-sky-600">Excusas</span>
                            </div>
                        </div>

                        {/* Recent incidents list */}
                        {child.attendance.recent_incidents.length > 0 && (
                            <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                                {child.attendance.recent_incidents.map((inc, idx) => {
                                    const meta = ATTENDANCE_META[inc.status];
                                    return (
                                        <li key={`${inc.date}-${idx}`}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenAttendanceIncident(inc)
                                                }
                                                className="flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-left transition hover:bg-slate-100/80"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800">
                                                        {formatShortDate(inc.date)} ·{" "}
                                                        {inc.subject_name ?? "Jornada"}
                                                    </p>
                                                    {inc.note && (
                                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                                            {inc.note}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* 4. UPCOMING ASSIGNMENTS */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-shadow text-primary-darker">
                                    <ClipboardList className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Próximas entregas
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Tareas, talleres y evaluaciones agendadas
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-primary-shadow px-2.5 py-0.5 text-xs font-medium text-primary-darker">
                                {pendingAssignmentsCount} pendientes
                            </span>
                        </div>

                        {child.upcoming_assignments.length === 0 ? (
                            <EmptyState
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                title="Sin entregas pendientes"
                                description="No hay tareas ni evaluaciones próximas registradas."
                            />
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {child.upcoming_assignments.map((asg) => (
                                    <li key={asg.id} className="py-2.5 first:pt-0 last:pb-0">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenAssignment(asg)}
                                            className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`truncate text-sm font-medium ${
                                                        asg.status === "submitted"
                                                            ? "text-slate-400 line-through"
                                                            : "text-slate-800"
                                                    }`}
                                                >
                                                    {asg.title}
                                                </p>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                    <span className="font-medium text-primary-darker">
                                                        {asg.subject_name}
                                                    </span>
                                                    <span>·</span>
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    <span>{formatShortDate(asg.due_date)}</span>
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                                                    asg.status === "submitted"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {asg.status === "submitted"
                                                    ? "Entregado"
                                                    : asg.type}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* 5. ANNOUNCEMENTS (Matches Principal Dashboard visual style) */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-shadow text-primary-darker">
                                    <Megaphone className="h-4 w-4" />
                                </span>
                                <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                                    Comunicados
                                </h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                {child.announcements.length}
                            </span>
                        </div>

                        {child.announcements.length === 0 ? (
                            <EmptyState
                                icon={<Calendar className="h-5 w-5 text-slate-400" />}
                                title="Sin comunicados recientes"
                                description="Los avisos del colegio y del curso aparecerán aquí."
                            />
                        ) : (
                            <ul className="no-scrollbar max-h-96 overflow-auto">
                                {featuredAnnouncement && featuredDate && (
                                    <li className="sticky top-0 left-0 z-10 bg-white pb-2.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenAnnouncement(featuredAnnouncement)
                                            }
                                            className="relative flex h-36 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-darker p-4 text-left text-white"
                                        >
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10"
                                            />
                                            <Megaphone
                                                aria-hidden="true"
                                                className="pointer-events-none absolute -right-2 bottom-2 h-24 w-24 -rotate-12 text-white/10"
                                            />

                                            <div className="relative z-10 flex items-center justify-between gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium capitalize">
                                                    <Calendar className="h-3 w-3" />
                                                    {featuredAnnouncement.scope === "curso"
                                                        ? `Curso ${child.course_name}`
                                                        : "Colegio"}{" "}
                                                    · {featuredAnnouncement.type}
                                                </span>
                                                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium capitalize">
                                                    {featuredDate.weekday} {featuredDate.dayNum}{" "}
                                                    {featuredDate.month}
                                                </span>
                                            </div>

                                            <div className="relative z-10 min-w-0 pr-8">
                                                <p className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
                                                    {featuredAnnouncement.title}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-white/80">
                                                    {featuredAnnouncement.summary}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                )}

                                {child.announcements.map((item) => {
                                    const { dayNum, month, weekday } =
                                        formatAnnouncementDate(item.published_at);
                                    return (
                                        <li
                                            key={item.id}
                                            className="border-b border-slate-100 py-2.5 last:border-b-0 last:pb-0"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAnnouncement(item)}
                                                className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                    <div className="flex w-[52px] shrink-0 flex-col items-center rounded-xl border border-primary/20 bg-primary-shadow py-1 text-primary-darker">
                                                        <span className="text-[11px] font-medium capitalize">
                                                            {weekday}
                                                        </span>
                                                        <span className="-my-1 text-base font-semibold">
                                                            {dayNum}
                                                        </span>
                                                        <span className="text-[11px] font-medium capitalize">
                                                            {month}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-slate-800">
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                                            {item.summary}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                                                        item.scope === "curso"
                                                            ? "bg-primary-shadow text-primary-darker"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {item.scope}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

/* ---------------- Subcomponents ---------------- */

function StatusPill({
                        label,
                        value,
                        tone,
                    }: {
    label: string;
    value: string;
    tone: "primary" | "success" | "warning" | "danger";
}) {
    const toneClasses = {
        primary: "bg-primary-shadow/40 text-primary-darker border-primary/15",
        success: "bg-emerald-50/70 text-emerald-700 border-emerald-100",
        warning: "bg-amber-50/70 text-amber-700 border-amber-100",
        danger: "bg-rose-50/70 text-rose-700 border-rose-100",
    }[tone];

    return (
        <div className={`rounded-lg border px-3 py-2 ${toneClasses}`}>
            <span className="block text-[11px] font-medium opacity-80">{label}</span>
            <span className="mt-0.5 block truncate text-xs font-semibold sm:text-sm">
                {value}
            </span>
        </div>
    );
}

function EmptyState({
                        icon,
                        title,
                        description,
                    }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                {icon}
            </div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
        </div>
    );
}