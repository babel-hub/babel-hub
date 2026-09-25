interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    loadingDelete?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loadingDelete }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center bg-black/30 backdrop-blur-xs justify-center">
            <div className="bg-white shadow-xl flex flex-col justify-center items-center rounded-lg p-3 w-80 md:w-86 xl:w-96 max-w-full mx-4">
                <div className="flex w-full justify-between items-center">
                    <h3 className="text-xl pl-2 font-bold text-custom-black">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-500 cursor-pointer p-1 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="w-full text-left">
                    <p className="text-gray-600 text-sm md:text-base mt-1 mb-5 px-2">{message}</p>
                </div>

                <div className="flex flex-col w-full md:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loadingDelete}
                        className={`px-4 py-2 w-full text-sm md:text-base rounded-xl transition ${
                            loadingDelete
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "cursor-pointer text-gray-700 bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm()}
                        disabled={loadingDelete}
                        className={`px-4 py-2 w-full text-sm md:text-base rounded-xl transition ${
                            loadingDelete
                                ? "bg-red-400 text-white cursor-not-allowed"
                                : "cursor-pointer text-white bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {loadingDelete ? "Eliminando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}