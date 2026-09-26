import {formatFullDateString} from "../../../../../utils/utils.ts";


export function StudentProfileSecurity({ isActive, createdAt }: { isActive: boolean, createdAt: string }) {
    return (
        <div className="animate-in fade-in duration-200 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Privacidad y Seguridad</h2>

            <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Estado de la Cuenta</h3>
                <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-white">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Estado</span>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isActive ? 'Activo' : 'Suspendido'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-sm font-medium text-gray-500">Fecha de Creación</span>
                        <span className="text-sm text-gray-900">{formatFullDateString(createdAt)}</span>
                    </div>
                </div>
            </div>

            <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Acciones Administrativas</h3>
                <div className="flex flex-col gap-3">
                    <div className="p-4 border border-gray-100 bg-white rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Restablecer Contraseña</p>
                            <p className="text-xs text-gray-500 mt-1">Fuerza al usuario a crear una nueva contraseña.</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-sm font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer">
                            Restablecer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}