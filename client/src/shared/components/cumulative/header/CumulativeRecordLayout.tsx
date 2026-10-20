import { LuClipboardCheck, LuClipboardPenLine, LuClipboardX, LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import React from "react";
import ButtonChevronBack from "../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { MetricButton } from "../ui/MetricButton.tsx";
import type { CumulativeMetrics, TabCumulativeTypes } from "../../../types/types.ts";

interface CumulativeRecordLayoutProps {
    tab: TabCumulativeTypes;
    setTab: (tab: TabCumulativeTypes) => void;
    children: React.ReactNode;
    metrics: CumulativeMetrics;
    loading: boolean;
}

export function CumulativeRecordLayout({ children, tab, setTab, metrics, loading }: CumulativeRecordLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full w-full">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">
                        Acumulados
                    </h1>
                </div>
            </div>

            <div className="flex p-4 items-center gap-5">
                <MetricButton
                    active={tab === "summary"}
                    onClick={() => setTab("summary")}
                    loading={loading}
                    icon={<LuUsers />}
                    value={metrics.activeStudents}
                    title="Resumen del grupo"
                    subtitle="Estudiantes activos"
                    skeletonDescriptionSize="w-10 h-3"
                    skeletonTitleSize="h-7 w-10"
                />

                <MetricButton
                    active={tab === "grades"}
                    onClick={() => setTab("grades")}
                    loading={loading}
                    icon={<LuClipboardPenLine />}
                    value={metrics.overallAverage.toFixed(2)}
                    title="Promedio general"
                    subtitle="Aumentó un -%"
                    skeletonDescriptionSize="w-10 h-3"
                    skeletonTitleSize="h-7 w-14"
                />

                <MetricButton
                    active={tab === "attendance"}
                    onClick={() => setTab("attendance")}
                    loading={loading}
                    icon={<LuClipboardCheck />}
                    value={`${metrics.attendanceRate.toFixed(2)}%`}
                    title="Asistencia general"
                    subtitle="Disminuyó un -%"
                    skeletonDescriptionSize="w-10 h-3"
                    skeletonTitleSize="h-7 w-16"
                />

                <MetricButton
                    active={tab === "absents"}
                    onClick={() => setTab("absents")}
                    loading={loading}
                    icon={<LuClipboardX />}
                    value={0}
                    title="Faltas cometidas"
                    subtitle="Disminuyeron -"
                    skeletonDescriptionSize="w-10 h-3"
                    skeletonTitleSize="h-7 w-10"
                />
            </div>

            <div className="flex-1 no-scrollbar overflow-y-auto">
                {children}
            </div>
        </div>
    );
}