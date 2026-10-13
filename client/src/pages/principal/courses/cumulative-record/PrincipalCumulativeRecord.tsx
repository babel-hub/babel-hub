import { CumulativeRecordLayout, Grades, Absents, Attendance, Summary } from "../../../../features/director/course-management";
import type { TabCumulativeTypes } from "../../../../features/types/types";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {usePeriods} from "../../../../shared/hooks/usePeriods.ts";
import {LoadingContent} from "../../../../components/ui/Loadings.tsx";
import {NoResults} from "../../../../components/ui/blocks/NoResults.tsx";

export default function PrincipalCumulativeRecord() {
    const { courseId } = useParams<{ courseId: string }>();
    const [tab, setTab] = useState<TabCumulativeTypes>("summary");
    const { periods } = usePeriods();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    useEffect(() => {
        if (!periods?.length || selectedPeriodId) return;
        const activePeriod = periods.find(p => p.is_current);
        setSelectedPeriodId(activePeriod?.id ?? periods[0].id);
    }, [periods, selectedPeriodId]);

    if (!courseId) return null;
    if (!periods) return <LoadingContent title="" />;
    if (periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId) return null;

    return (
        <CumulativeRecordLayout
            tab={tab}
            setTab={setTab}
        >
            {tab === "summary" && (<Summary courseId={courseId} periodId={selectedPeriodId}/>)}
            {tab === "grades" && (<Grades courseId={courseId} periodId={selectedPeriodId}/>)}
            {tab === "absents" && (<Absents />)}
            {tab === "attendance" && (<Attendance />)}
        </CumulativeRecordLayout>
    )
}