import React from "react";
import { calculateOverlaps, getAreaColor, HOUR_HEIGHT, timeToPosition } from "./calendar.utils.ts";
import type { TeacherSchedule } from "./calendar.types.ts";
import { ActionMenu, type MenuOption } from "../menu/ActionMenu.tsx";
import { HiPencil, HiTrash } from "react-icons/hi";

interface CalendarGridProps {
    schedule: TeacherSchedule[];
    onEdit: (schedule: TeacherSchedule) => void;
    onDelete: (classId: string) => void;
}

export function Schedule({ schedule, onEdit, onDelete }: CalendarGridProps) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 5);
    const days = [
        { num: 1, label: 'Lunes' },
        { num: 2, label: 'Martes' },
        { num: 3, label: 'Miércoles' },
        { num: 4, label: 'Jueves' },
        { num: 5, label: 'Viernes' },
        { num: 6, label: 'Sábado' }
    ];

    return (
        <div className="flex flex-col h-auto bg-white w-full min-w-2xl">
            <div className="grid grid-cols-[50px_repeat(6,1fr)] sticky top-0 bg-white z-30">
                <div className="p-4 border-r border-gray-100 sticky left-0 bg-white z-40"></div>
                {days.map(day => (
                    <div key={day.num} className="p-3 text-center text-sm border-r last:border-r-0 border-gray-100 transition-colors text-gray-600 font-semibold">
                        {day.label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-[50px_repeat(6,1fr)] relative bg-white">
                <div className="border-r border-gray-100 flex flex-col relative z-20 bg-white sticky left-0 shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
                    {hours.map(hour => (
                        <div key={hour} className="h-28 first:invisible relative pr-3 text-right">
                            <span className="text-xs absolute -top-2.5 right-3 text-gray-400 font-medium">{hour}:00</span>
                        </div>
                    ))}
                </div>

                {days.map(day => (
                    <div key={day.num} className="relative">
                        {hours.map(hour => {
                            const topOffset = (hour - 5) * HOUR_HEIGHT;
                            return (
                                <React.Fragment key={hour}>
                                    <div className="w-full border-b border-gray-300 absolute left-0" style={{ top: `${topOffset}px` }}></div>
                                    <div className="w-full border-b border-gray-200 border-dashed absolute left-0 opacity-50" style={{ top: `${topOffset + (HOUR_HEIGHT / 2)}px` }}></div>
                                </React.Fragment>
                            )
                        })}

                        {calculateOverlaps(schedule.filter(s => s.day_of_week === day.num))
                            .map((cls) => {
                                const topPx = timeToPosition(cls.start_time);
                                const bottomPx = timeToPosition(cls.end_time);
                                const heightPx = bottomPx - topPx;
                                const colors = getAreaColor(cls.area_name);

                                const width = `calc(${100 / cls.maxCol}% - 4px)`;
                                const left = `calc(${(100 / cls.maxCol) * cls.col}% + 2px)`;

                                const menuOptions: MenuOption[] = [
                                    {
                                        label: "Editar",
                                        icon: <HiPencil className="size-4" />,
                                        onClick: () => onEdit(cls),
                                    },
                                    {
                                        isSeparator: true,
                                        label: "separator"
                                    },
                                    {
                                        label: "Eliminar",
                                        icon: <HiTrash className="size-4" />,
                                        onClick: () => onDelete(cls.id),
                                        isDanger: true,
                                    }
                                ];

                                return (
                                    <div
                                        key={cls.id}
                                        className={`absolute rounded-xl p-2 group border hover:z-20 hover:shadow-md transition-all z-10 ${colors.bg} ${colors.border}`}
                                        style={{ top: `${topPx}px`, height: `${heightPx}px`, width, left }}
                                    >
                                        <div className="text-left pr-4">
                                            <p className={`text-xs capitalize font-bold leading-tight ${colors.text}`}>{cls.subject_name}</p>
                                            {
                                                heightPx > 55 ? (
                                                    <div>
                                                        <p className={`text-[10px] mt-1 capitalize opacity-90 ${colors.text}`}>
                                                            {cls.course_name}{cls.room ? ` • ${cls.room}` : ''}
                                                        </p>
                                                        <p className={`text-[10px] opacity-75 mt-0.5 ${colors.text}`}>
                                                            {cls.start_time.substring(0,5)} - {cls.end_time.substring(0,5)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className={`text-[10px] mt-1 capitalize opacity-90 ${colors.text}`}>
                                                            {cls.course_name} {cls.room ? ` • ${cls.room}` : ''} {cls.start_time.substring(0,5)} - {cls.end_time.substring(0,5)}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                        </div>

                                        <div className="group-hover:inline hidden absolute top-1.5 right-1">
                                            <ActionMenu options={menuOptions} />
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                ))}
            </div>
        </div>
    );
}