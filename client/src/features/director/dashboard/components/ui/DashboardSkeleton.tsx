export function DashboardSkeleton() {
    return (
        <div className="w-full h-[calc(100dvh-1.5rem)] flex flex-col gap-3 animate-pulse">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 shrink-0">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-xl bg-slate-200/70" />
                ))}
            </div>

            <div className="grid grid-cols-1 flex-1 min-h-0 gap-3 md:grid-cols-3">
                <div className="h-full rounded-xl bg-slate-200/70" />
                <div className="h-full rounded-xl bg-slate-200/70" />
                <div className="h-full rounded-xl bg-slate-200/70" />
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12 shrink-0">
                <div className="h-72 rounded-xl bg-slate-200/70 xl:col-span-8" />
                <div className="h-72 rounded-xl bg-slate-200/70 xl:col-span-4" />
            </div>
        </div>

    );
}