import React, { useState, useEffect } from "react";

const HOUR_HEIGHT = 112;

const timeToPosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const startHour = 5;
    return (hours - startHour) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT + 1.2;
};

const SUBJECT_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
];

const getSubjectColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

export interface TeacherSchedule {
    course_id: string;
    course_name: string;
    class_id: string;
    subject_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
}

const calculateOverlaps = (events: TeacherSchedule[]) => {
    const sorted = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const result: (TeacherSchedule & { col: number; maxCol: number })[] = [];

    let currentCluster: typeof result = [];
    let clusterEnd = "00:00";

    sorted.forEach(event => {
        if (event.start_time >= clusterEnd) {
            currentCluster.forEach(c => c.maxCol = Math.max(...currentCluster.map(x => x.col)) + 1);
            currentCluster = [];
            clusterEnd = event.end_time;
        } else {
            if (event.end_time > clusterEnd) clusterEnd = event.end_time;
        }

        let col = 0;
        while (currentCluster.some(c => c.col === col && c.end_time > event.start_time)) {
            col++;
        }

        const eventWithCols = { ...event, col, maxCol: 1 };
        currentCluster.push(eventWithCols);
        result.push(eventWithCols);
    });

    currentCluster.forEach(c => c.maxCol = Math.max(...currentCluster.map(x => x.col)) + 1);

    return result;
};

interface CalendarGridProps {
    schedule: TeacherSchedule[];
}

export function CalendarGrid({ schedule }: CalendarGridProps) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 5);
    const days = [
        { num: 1, label: 'Lunes' },
        { num: 2, label: 'Martes' },
        { num: 3, label: 'Miércoles' },
        { num: 4, label: 'Jueves' },
        { num: 5, label: 'Viernes' },
        { num: 6, label: 'Sábado' }
    ];

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const currentDayNum = now.getDay() === 0 ? 7 : now.getDay();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentTopPx = timeToPosition(currentTimeStr);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl w-full min-w-2xl max-w-7xl overflow-auto no-scrollbar border border-gray-100">

            <div className="grid grid-cols-[50px_repeat(6,1fr)] border-b border-gray-100 sticky top-0 bg-white z-30">
                <div className="p-4 border-r border-gray-100 sticky left-0 bg-white z-40"></div>
                {days.map(day => {
                    const isToday = day.num === currentDayNum;
                    return (
                        <div key={day.num} className={`p-3 text-center text-sm border-r border-gray-100 transition-colors ${isToday ? 'bg-primary-shadow text-primary-darker font-bold' : 'text-gray-600 font-semibold'}`}>
                            {day.label}
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-[50px_repeat(6,1fr)] relative bg-gray-50/30">
                <div className="border-r border-gray-100 flex flex-col relative z-20 bg-white sticky left-0 shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
                    {hours.map(hour => (
                        <div key={hour} className="h-28 first:invisible relative pr-3 text-right">
                            <span className="text-xs absolute -top-2.5 right-3 text-gray-400 font-medium">{hour}:00</span>
                        </div>
                    ))}
                </div>

                {days.map(day => (
                    <div key={day.num} className={`relative ${day.num === currentDayNum ? 'bg-primary-shadow/30' : ''}`}>

                        {hours.map(hour => {
                            const topOffset = (hour - 5) * HOUR_HEIGHT;
                            return (
                                <React.Fragment key={hour}>
                                    <div className="w-full border-b border-gray-300 absolute left-0" style={{ top: `${topOffset}px` }}></div>
                                    <div className="w-full border-b border-gray-200 border-dashed absolute left-0 opacity-50" style={{ top: `${topOffset + (HOUR_HEIGHT / 2)}px` }}></div>
                                </React.Fragment>
                            )
                        })}

                        {day.num === currentDayNum && currentTopPx >= 0 && currentTopPx <= (hours.length * HOUR_HEIGHT) && (
                            <div className="absolute left-0 w-full z-30 flex items-center pointer-events-none" style={{ top: `${currentTopPx}px`, transform: 'translateY(-50%)' }}>
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-[5px]"></div>
                                <div className="flex-1 border-b-2 border-red-500"></div>
                            </div>
                        )}

                        {calculateOverlaps(schedule.filter(s => s.day_of_week === day.num))
                            .map((cls) => {
                                const topPx = timeToPosition(cls.start_time);
                                const bottomPx = timeToPosition(cls.end_time);
                                const heightPx = bottomPx - topPx;
                                const colors = getSubjectColor(cls.subject_name);

                                const width = `calc(${100 / cls.maxCol}% - 4px)`;
                                const left = `calc(${(100 / cls.maxCol) * cls.col}% + 2px)`;

                                return (
                                    <div
                                        key={cls.class_id}
                                        className={`absolute rounded-xl p-2 border hover:z-20 hover:shadow-md transition-all cursor-pointer overflow-hidden z-10 ${colors.bg} ${colors.border}`}
                                        style={{ top: `${topPx}px`, height: `${heightPx}px`, width, left }}
                                    >
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
                                )
                            })}
                    </div>
                ))}
            </div>
        </div>
    );
}