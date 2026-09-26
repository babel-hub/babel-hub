export function StudentProfileClasses({ classes }: { classes: any[] }) {
    if (!classes || classes.length === 0) {
        return (
            <div className="animate-in fade-in duration-200 max-w-3xl">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Clases Asignadas</h2>
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                    El estudiante no tiene clases inscritas.
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-200 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Clases Asignadas ({classes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classes.map(cls => (
                    <div key={cls.class_id} className="p-4 border border-gray-100 bg-white rounded-xl shadow-sm">
                        <p className="text-sm font-bold text-gray-900 capitalize">{cls.subject_name}</p>
                        <p className="text-xs text-gray-500 capitalize mt-1">Prof. {cls.first_name} {cls.first_last_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}