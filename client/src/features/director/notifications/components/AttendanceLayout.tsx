import ButtonChevronBack from "../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { useNavigate } from "react-router-dom";
import {useMemo, useState, useEffect} from "react";
import { usePeriods } from "../../../../shared/hooks/usePeriods.ts";
import { useAttendanceSummary } from "../hooks/useAttendanceSummary.ts";
import {AttendanceList} from "./ui/AttendanceList.tsx";
import {LoadingContent} from "../../../../components/ui/Loadings.tsx";
import {NoResults} from "../../../../components/ui/blocks/NoResults.tsx";
import {formatterDate} from "../../../../types";

export function AttendanceLayout() {
    const { periods } = usePeriods();
    const navigate = useNavigate();

    const today = formatterDate.format(new Date);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    const selectedPeriod = periods?.find(period => period.id === selectedPeriodId);

    const startDate = selectedPeriod?.start_date ? selectedPeriod.start_date.slice(0, 10) : "";
    const endDate = selectedPeriod?.end_date ? selectedPeriod.end_date.slice(0, 10) : "";

    const { loading, attendance } = useAttendanceSummary({
        startDate,
        endDate,
        todayDate: today
    });

    const uniqueCourses = useMemo(() => {
        return Array.from(
            new Set(attendance.map(item => item.course_name))
        ).sort();
    }, [attendance]);

    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId || loading || !selectedPeriod) return null;

    return (
        <div className="flex flex-col h-full md:gap-3">
            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4 flex flex-col sm:flex-row items-start gap-3 sm:items-center sm:justify-between">
                <div className="flex gap-2 items-center">
                    <ButtonChevronBack onClick={() => navigate(-1)}/>
                    <div>
                        <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Asistencias</h1>
                        <p className="text-gray-400 mt-1 text-sm">Monitorea las inasistencias y llegadas tarde</p>
                    </div>
                </div>
                <div className="self-end sm:self-auto">
                    <select
                        className="bg-white text-sm capitalize appearance-none text-custom-black border border-gray-200 rounded-xl md:px-4 p-2 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                        value={selectedPeriod?.id || ""}
                        onChange={(e) => setSelectedPeriodId(e.target.value)}
                    >
                        {periods?.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="md:h-full bg-white md:rounded-xl p-3 md:p-5 border border-gray-100 no-scrollbar overflow-x-auto">
                <div className="flex flex-col gap-5 relative">
                    {loading && (<LoadingContent title="Cargando asistencia" />)}

                    <AttendanceList
                        attendance={attendance}
                        uniqueCourses={uniqueCourses}
                        period={selectedPeriod}
                    />
                </div>
            </div>
        </div>
    )
}