interface ReportStat {
    total: number;
    remaining: number;
}

export function ReportStat ({ total, remaining }: ReportStat) {
    return (
        <div className="border flex flex-col border-gray-200 rounded-xl w-full p-2">
            <span className="text-xs text-gray-400">Estudiantes</span>
            <div className="flex gap-2 items-start">
                <span className="text-xl font-bold">{total}</span>
            </div>
            <div className="flex gap-2 justify-between items-center">
                <p className="w-full text-xs text-gray-400 max-w-3/4">Asignaturas reprobadas</p>
                <span className="text-xs">{remaining}</span>
            </div>
        </div>
    )
}