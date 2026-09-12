import { PieChart, Pie, Cell } from "recharts";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
// import { colorForIndex } from "../utils/gradesUi.utils.ts";
import type { SubjectAccumulated } from "../../types/types.ts";
import {CRITERIA_COLORS} from "./DayDetailPanel.tsx";

export function colorForIndex(index: number): string {
    return CRITERIA_COLORS[index % CRITERIA_COLORS.length];
}

interface AccumulatedPanelProps {
    accumulated: SubjectAccumulated | null;
    insight?: string;
}

export function AccumulatedPanel({ accumulated, insight }: AccumulatedPanelProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 flex flex-col gap-4">
            <div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Acumulado</span>
                    <HiOutlineInformationCircle className="text-gray-300 text-lg" />
                </div>
                <h3 className="text-custom-black font-bold text-xl capitalize">
                    {accumulated?.subject_name ?? "—"}
                </h3>
            </div>

            {accumulated && accumulated.breakdown.length > 0 ? (
                <>
                    <div className="relative w-44 h-44 mx-auto">
                        <PieChart width={176} height={176}>
                            <Pie
                                data={accumulated.breakdown}
                                dataKey="weight"
                                nameKey="criteria_name"
                                innerRadius={58}
                                outerRadius={82}
                                paddingAngle={2}
                                stroke="none"
                                isAnimationActive={false}
                            >
                                {accumulated.breakdown.map((_, i) => (
                                    <Cell key={i} fill={colorForIndex(i)} />
                                ))}
                            </Pie>
                        </PieChart>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-custom-black">
                                {accumulated.period_average.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">de {accumulated.scale_max.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {accumulated.breakdown.map((b, i) => (
                            <div key={b.criteria_name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: colorForIndex(i) }}
                                    />
                                    <span className="font-medium text-custom-black capitalize truncate">
                                        {b.criteria_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-gray-400">{b.weight}%</span>
                                    <span className="font-bold text-custom-black">{b.average.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {insight && (
                        <div className="bg-slate-900 rounded-xl p-4 text-white">
                            <p className="text-gray-300 text-xs font-semibold mb-1">Lectura rápida</p>
                            <p className="text-sm leading-snug">{insight}</p>
                        </div>
                    )}
                </>
            ) : (
                <NoResults title="No hay datos acumulados todavía" />
            )}
        </div>
    );
}