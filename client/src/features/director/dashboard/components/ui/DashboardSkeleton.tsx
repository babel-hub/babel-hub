export function DashboardSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl animate-pulse space-y-5 p-4 sm:p-6">
            <div className="h-16 rounded-xl bg-slate-200/70" />
            <div className="grid grid-cols-2 gap-3 sm:gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-xl bg-slate-200/70" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="h-52 rounded-xl bg-slate-200/70" />
                <div className="h-52 rounded-xl bg-slate-200/70" />
            </div>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                <div className="h-72 rounded-xl bg-slate-200/70 xl:col-span-8" />
                <div className="h-72 rounded-xl bg-slate-200/70 xl:col-span-4" />
            </div>
        </div>
    );
}