import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { formatterDate } from "../../../types";
import {useState} from "react";
import type { TeacherSchedule } from "./calendar.types.ts";

interface CalendarProps {
    schedule: TeacherSchedule[];
    monthActivities: any[];
    selectedDate: string;
    onSelectDate: (dateStr: string) => void;
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    loading: boolean;
}

export function Calendar({
                             monthActivities = [],
                             selectedDate,
                             onSelectDate,
                             currentMonth,
                             setCurrentMonth,
                             loading
                         }: CalendarProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const blanksCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    console.log(showCalendar)
    return (
        <div className="w-full relative bg-white md:rounded-xl lg:py-3 flex flex-col relative">
            {loading && (
                <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex justify-between p-4 lg:pt-0 lg:pb-3 items-center">
                <div className="flex items-center justify-between w-full">
                    <button onClick={handlePrevMonth} className="p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        <LuChevronLeft className="size-4" />
                    </button>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                    >
                        <h3 className="font-bold text-custom-black capitalize text-sm">
                            {monthNames[month]} {year}
                        </h3>
                    </button>
                    <button onClick={handleNextMonth} className="p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        <LuChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            <div className={`absolute lg:relative w-full top-full z-50 lg:z-0 left-0 bg-white rounded-b-xl lg:rounded-none border-b lg:border-none border-gray-200 py-3 lg:py-0 ${showCalendar ? 'block' : 'hidden lg:block'}`}>
                <div className="grid grid-cols-7 px-2">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-gray-400">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 px-2 gap-y-1 gap-x-1">
                    {Array.from({ length: blanksCount }).map((_, i) => (
                        <div key={`blank-${i}`} className="h-9" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;

                        const currentDateStr = formatterDate.format(new Date(year, month, dayNum));

                        const dayAssignments = monthActivities.filter(a => a.assignment_due_date.startsWith(currentDateStr));
                        const hasDeadline = dayAssignments.length > 0;

                        const isSelected = selectedDate === currentDateStr;
                        const isToday = formatterDate.format(new Date()) === currentDateStr;

                        return (
                            <div
                                key={dayNum}
                                className="flex justify-center relative h-9"
                                title={`${dayAssignments.length > 0 ? `${dayAssignments.length} pendiente(s)` : ''}`}
                            >
                                <button
                                    onClick={() => {
                                        onSelectDate(currentDateStr)
                                        setShowCalendar(false);
                                    }}
                                    className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm transition-all z-10 cursor-pointer
                                    ${isSelected ? 'bg-primary text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}
                                    ${isToday && !isSelected ? 'text-primary border border-primary font-bold' : ''}
                                `}
                                >
                                    {dayNum}
                                </button>

                                <div className="absolute bottom-0 flex gap-0.5 z-20 pointer-events-none">
                                    {hasDeadline && (
                                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}