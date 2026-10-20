import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from "recharts";
import type { CumulativeGrades, Scale } from "../../../types/types.ts";

interface CourseRadarChartProps {
    grades: CumulativeGrades[];
    scalesById: Map<string, Scale>;
}

export function CourseRadarChart({ grades, scalesById }: CourseRadarChartProps) {
    const subjectData = new Map<string, { sum: number; count: number; scale_id: string }>();

    grades.forEach(student => {
        student.subjects?.forEach(sub => {
            if (sub.final_grade > 0) {
                const current = subjectData.get(sub.subject_name) || { sum: 0, count: 0, scale_id: sub.scale_id };
                current.sum += sub.final_grade;
                current.count += 1;
                subjectData.set(sub.subject_name, current);
            }
        });
    });

    const data = Array.from(subjectData.entries()).map(([subject, { sum, count }]) => {
        const avg = sum / count;
        return {
            subject,
            average: Number(avg.toFixed(2)),
        };
    });

    if (data.length < 3) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Se necesitan al menos 3 asignaturas con notas para mostrar el radar.
            </div>
        );
    }

    const firstScaleId = Array.from(subjectData.values())[0]?.scale_id;
    const scale = scalesById.get(firstScaleId);
    const maxDomain = scale ? Number(scale.max_value) : 5; // fallback to 5

    // Clamp the values for the chart so a 10.1 doesn't draw outside the radar grid
    const chartData = data.map(d => ({
        ...d,
        visualAverage: Math.min(d.average, maxDomain)
    }));

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-4 p-2">
            <div className="flex-1 order-1 h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#4b5563', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, maxDomain]}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                        />
                        <Tooltip
                            formatter={(_, __, props) => {
                                const actualAvg = props.payload.average;
                                const isOverMax = actualAvg > maxDomain;
                                return [
                                    `${actualAvg} / ${maxDomain}${isOverMax ? " ⚠️" : ""}`,
                                    "Promedio"
                                ];
                            }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Radar
                            name="Promedio"
                            dataKey="visualAverage"
                            stroke="#7c3aed"
                            fill="#7c3aed"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex-1 h-full overflow-y-auto no-scrollbar pr-2 flex flex-col justify-center">
                <ul className="flex flex-col gap-1.5">
                    {data.map((item) => {
                        const isOverMax = item.average > maxDomain;
                        return (
                            <li
                                key={item.subject}
                                className="flex items-center justify-between text-base border-b border-gray-100 last:border-0 pb-1.5 last:pb-0"
                            >
                                <span className="text-gray-600 capitalize truncate mr-2">
                                    {item.subject}
                                </span>
                                <span className={`font-semibold tabular-nums shrink-0 ${isOverMax ? 'text-red-500' : 'text-gray-800'}`}>
                                    {item.average.toFixed(2)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}