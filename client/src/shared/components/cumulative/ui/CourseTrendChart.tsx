import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { CoursePeriodTrend } from "../../../types/types.ts";

interface CourseTrendChartProps {
    trend: CoursePeriodTrend[];
}

export function CourseTrendChart({ trend }: CourseTrendChartProps) {
    if (!trend || trend.length === 0 || trend.every((t) => t.course_average === null)) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Sin datos de tendencia
            </div>
        );
    }

    const data = trend.map(t => ({
        name: t.period_name,
        average: t.course_average,
        graded: t.graded_students,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                />

                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    domain={[0, 'auto']}
                />

                <Tooltip
                    formatter={(value,_ , props) => {
                        const v = value as number | null;
                        if (v == null) return ["Sin datos", "Promedio"];
                        return [
                            `${v.toFixed(2)} (${props.payload.graded} alumnos)`,
                            "Promedio"
                        ];
                    }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />

                <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}