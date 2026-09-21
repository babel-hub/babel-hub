import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export interface TeacherSchedule {
    course_id: string;
    course_name: string;
    class_id: string;
    subject_name: string;
    area_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
}

interface MiniCalendarProps {
    schedule: TeacherSchedule[];
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export function Calendar({ schedule, selectedDate, onSelectDate }: MiniCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const blanksCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const hasClasses = (dayNum: number) => {
        const date = new Date(year, month, dayNum);
        const jsDay = date.getDay();
        const dbDay = jsDay === 0 ? 7 : jsDay;

        return schedule.some(s => s.day_of_week === dbDay);
    };

    const isToday = (dayNum: number) => {
        const today = new Date();
        return today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
    };

    const isSelected = (dayNum: number) => {
        if (!selectedDate) return false;
        return selectedDate.getDate() === dayNum && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    };

    return (
        <div className="w-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-800 capitalize text-sm">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        <LuChevronLeft className="size-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        <LuChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2">
                {Array.from({ length: blanksCount }).map((_, i) => (
                    <div key={`blank-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const active = hasClasses(dayNum);
                    const selected = isSelected(dayNum);
                    const today = isToday(dayNum);

                    return (
                        <div key={dayNum} className="flex justify-center relative h-8">
                            <button
                                onClick={() => onSelectDate(new Date(year, month, dayNum))}
                                className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm transition-colors z-10 cursor-pointer
                                    ${selected ? 'bg-primary text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}
                                    ${today && !selected ? 'text-primary font-bold' : ''}
                                `}
                            >
                                {dayNum}
                            </button>

                            {active && !selected && (
                                <div className="absolute bottom-0 w-1 h-1 rounded-xl bg-primary/60"></div>
                            )}
                            {active && selected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-xl bg-white"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}