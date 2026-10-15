import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { usePeriods } from "../../../../shared/hooks/usePeriods.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import type { CumulativeMetrics, TabCumulativeTypes } from "../../../../shared/types/types.ts";
import { useCumulativeSummary } from "../../../../shared/hooks/cumulative/useCumulativeSummary.ts";

import { CumulativeRecordLayout, Grades, Absents, Summary, Attendance } from "../../../../shared/components/cumulative";

export default function PrincipalCumulativeRecord() {
    const { courseId } = useParams<{ courseId: string }>();
    const [tab, setTab] = useState<TabCumulativeTypes>("summary");
    const { periods } = usePeriods();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    useEffect(() => {
        if (!periods?.length || selectedPeriodId) return;
        const active = periods.find(p => p.is_current) ?? periods[0];
        setSelectedPeriodId(active.id);
    }, [periods, selectedPeriodId]);

    const { summary, loading } = useCumulativeSummary(
        courseId ?? "",
        selectedPeriodId
    );

    const metrics = useMemo<CumulativeMetrics>(() => {
        if (!summary?.length) {
            return { activeStudents: 0, overallAverage: 0, attendanceRate: 0, totalAbsences: 0 };
        }
        const n = summary.length;
        return {
            activeStudents: n,
            overallAverage: summary.reduce((a, s) => a + (s.period_average ?? 0), 0) / n,
            attendanceRate: summary.reduce((a, s) => a + (s.attendance_rate ?? 0), 0) / n,
            totalAbsences: summary.reduce((a, s) => a + (s.total_absences ?? 0), 0),
        };
    }, [summary]);

    if (!courseId) return null;
    if (!periods) return <LoadingContent title="" />;
    if (periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId) return <LoadingContent title="" />;

    return (
        <CumulativeRecordLayout
            loading={loading}
            tab={tab}
            setTab={setTab}
            metrics={metrics}
        >
            {tab === "summary" && <Summary loading={loading} summary={summary} />}
            {tab === "grades" && <Grades courseId={courseId} periodId={selectedPeriodId} />}
            {tab === "absents" && <Absents />}
            {tab === "attendance" && <Attendance />}
        </CumulativeRecordLayout>
    );
}