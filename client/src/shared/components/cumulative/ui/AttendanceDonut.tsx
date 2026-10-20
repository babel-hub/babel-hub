import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { CumulativeSummary } from "../../../types/types.ts";

interface AttendanceDonutProps {
    summary: CumulativeSummary[];
}

export function AttendanceDonut({ summary }: AttendanceDonutProps) {
    const totals = summary.reduce(
        (acc, s) => ({
            present: acc.present + s.attendance.present,
            absent:  acc.absent  + s.attendance.absent,
            late:    acc.late    + s.attendance.late,
            excused: acc.excused + s.attendance.excused,
        }),
        { present: 0, absent: 0, late: 0, excused: 0 }
    );

    const total = totals.present + totals.absent + totals.late + totals.excused;
    const rate = total > 0 ? Math.round((totals.present / total) * 100) : 0;

    const data = [
        { name: "Presente", value: totals.present, color: "#16a34a" },
        { name: "Tardanza", value: totals.late,    color: "#ca8a04" },
        { name: "Excusado", value: totals.excused, color: "#ea580c" },
        { name: "Ausente",  value: totals.absent,  color: "#dc2626" },
    ].filter(d => d.value > 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Sin asistencias registradas
            </div>
        );
    }

    return (
        <div className="w-full h-full flex gap-3">
            <div className="relative w-1/2 h-full shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="85%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-800">{rate}%</span>
                    <span className="text-xs text-gray-500">Asistencia</span>
                </div>
            </div>

            <ul className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                {data.map((item) => {
                    const pct = Math.round((item.value / total) * 100);
                    return (
                        <li
                            key={item.name}
                            className="flex items-center justify-between gap-2 text-xs"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-600 truncate">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-800 tabular-nums shrink-0">
                                {item.value}
                                <span className="text-gray-400 font-normal ml-1">
                                    ({pct}%)
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}