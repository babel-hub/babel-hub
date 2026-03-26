import { IoWarningOutline } from "react-icons/io5";

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
        <div className="fixed inset-0 z-50 flex items-center bg-black/20 backdrop-blur-sm justify-center">
            <div className="bg-white shadow-xl flex flex-col justify-center items-center text-center gap-5 rounded-lg p-6 w-80 md:w-86 max-w-full mx-4">
                <div className="p-3 rounded-full text-red-error bg-red-100 text-5xl">
                    <IoWarningOutline />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm md:text-base">{message}</p>

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