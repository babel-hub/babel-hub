import {LuClipboardCheck, LuClipboardPenLine, LuClipboardX, LuUsers} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import React from "react";
import ButtonChevronBack from "../../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import type { TabCumulativeTypes } from "../../../../../types/types.ts";

interface CumulativeRecordLayoutProps {
    tab: TabCumulativeTypes;
    setTab: (tab: TabCumulativeTypes) => void;
    children: React.ReactNode;
}

export function CumulativeRecordLayout({ children, tab, setTab }: CumulativeRecordLayoutProps) {
    const navigate = useNavigate();

    const overallAverage = 4.7;
    const attendanceRate = 96;
    const totalAbsences = 15;

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
                <button
                    onClick={() => setTab("summary")}
                    className={`border flex gap-5 items-start rounded-xl p-2 ${tab === "summary" ? "bg-primary text-white border-primary" : "bg-transparent border-gray-200 text-custom-black"}`}
                >
                    <LuUsers className={`size-7 ${tab === "summary" ? "text-white" : "text-primary-darker"}`} />
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-2xl font-semibold">20</span>
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-sm font-medium leading-5">Resumen del grupo</p>
                            <span className={`text-xs ${tab === "summary" ? "text-white" : "text-gray-500"} leading-none`}>Estudiantes activos</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setTab("grades")}
                    className={`border flex gap-5 items-start rounded-xl p-2 ${tab === "grades" ? "bg-primary text-white border-primary" : "bg-transparent border-gray-200 text-custom-black"}`}
                >
                    <LuClipboardPenLine className={`size-7 ${tab === "grades" ? "text-white" : "text-primary-darker"}`} />
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-2xl font-semibold">{overallAverage}</span>
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-sm font-medium leading-5">Promedio general</p>
                            <span className={`text-xs ${tab === "grades" ? "text-white" : "text-gray-500"} leading-none`}>Aumento un 4%</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setTab("attendance")}
                    className={`border flex gap-5 items-start rounded-xl p-2 ${tab === "attendance" ? "bg-primary text-white border-primary" : "bg-transparent border-gray-200 text-custom-black"}`}
                >
                    <LuClipboardCheck className={`size-7 ${tab === "attendance" ? "text-white" : "text-primary-darker"}`} />
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-2xl font-semibold">{attendanceRate}%</span>
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-sm font-medium leading-5">Asistencia general</p>
                            <span className={`text-xs ${tab === "attendance" ? "text-white" : "text-gray-500"} leading-none`}>Disminuyo un 4%</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setTab("absents")}
                    className={`border flex gap-5 items-start rounded-xl p-2 ${tab === "absents" ? "bg-primary text-white border-primary" : "bg-transparent border-gray-200 text-custom-black"}`}
                >
                    <LuClipboardX className={`size-7 ${tab === "absents" ? "text-white" : "text-primary-darker"}`} />
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-2xl font-semibold">{totalAbsences}</span>
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-sm font-medium leading-5">Faltas cometidas</p>
                            <span className={`text-xs ${tab === "absents" ? "text-white" : "text-gray-500"} leading-none`}>Disminuyeron 3</span>
                        </div>
                    </div>
                </button>
            </div>

            <div className="flex-1 no-scrollbar overflow-y-auto">
                {children}
            </div>
        </div>
    );
}