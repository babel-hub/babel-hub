import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { CumulativeSummary } from "../../../types/types.ts";
import { useScales } from "../../../hooks/useScales.ts";

interface GradeDonutProps {
    summary: CumulativeSummary[];
}

const COLORS = {
    bad: "#ef4444",
    medium: "#f59e0b",
    good: "#3b82f6",
    excellent: "#10b981",
};

export function GradeDonut({ summary }: GradeDonutProps) {
    const { scales } = useScales();
    const gradedStudents = summary.filter(s => s.period_average != null);

    if (gradedStudents.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Sin calificaciones registradas
            </div>
        );
    }

    const scalesById = new Map(scales?.map(s => [s.id, s]) ?? []);
    const scaleCounts = summary.reduce((acc, s) => {
        if (s.scale_id) acc[s.scale_id] = (acc[s.scale_id] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dominantScaleId = Object.entries(scaleCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

    const scale = dominantScaleId ? scalesById.get(dominantScaleId) : undefined;

    if (!scale) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Sin datos de escala
            </div>
        );
    }

    const min = Number(scale.min_value);
    const max = Number(scale.max_value);
    const passing = Number(scale.passing_value);

    const passingThreshold = passing > min ? passing : min + (max - min) * 0.6;

    const remainingRange = max - passingThreshold;
    const step = remainingRange / 3;

    const basicMax = passingThreshold + step;
    const highMax = passingThreshold + step * 2;

    let bad = 0, medium = 0, good = 0, excellent = 0;

    gradedStudents.forEach(s => {
        const avg = s.period_average!;
        if (avg < passingThreshold) bad++;
        else if (avg < basicMax) medium++;
        else if (avg < highMax) good++;
        else excellent++;
    });

    const data = [
        { name: "Bajo", value: bad, color: COLORS.bad },
        { name: "Básico", value: medium, color: COLORS.medium },
        { name: "Alto", value: good, color: COLORS.good },
        { name: "Superior", value: excellent, color: COLORS.excellent },
    ].filter(d => d.value > 0);

    const totalGraded = gradedStudents.length;
    const overallAvg = gradedStudents.reduce((acc, s) => acc + s.period_average!, 0) / totalGraded;

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
                    <span className="text-2xl font-bold text-gray-800">{overallAvg.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">Promedio</span>
                </div>
            </div>

            <ul className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                {data.map((item) => {
                    const pct = Math.round((item.value / totalGraded) * 100);
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