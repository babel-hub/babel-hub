import { useEffect, useRef, useState } from "react";
import { useMonitoringMessages } from "../../hooks/coexistence/useMonitoringMessages.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { formatFullDateString } from "../../../../features/utils/utils.ts";
import { HiX, HiPaperAirplane } from "react-icons/hi";
import toast from "react-hot-toast";

interface MonitoringMessagesModalProps {
    monitoringId: string;
    monitoringTitle: string;
    onClose: () => void;
}

export function MonitoringMessagesModal({ monitoringId, monitoringTitle, onClose }: MonitoringMessagesModalProps) {
    const { messages, loading, error, sending, send } = useMonitoringMessages(monitoringId);
    const [draft, setDraft] = useState("");
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        const content = draft.trim();
        if (!content) return;
        try {
            await send(content);
            setDraft("");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "No se pudo enviar el mensaje");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-semibold text-gray-800">Mensajes</h3>
                        <p className="text-xs text-gray-500">{monitoringTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <HiX className="size-5" />
                    </button>
                </div>

                <ul ref={listRef} className="flex-1 overflow-y-auto styled-scrollbar p-4 flex flex-col gap-3">
                    {loading && <LoadingContent title="" />}
                    {error && <NoResults title={error} />}
                    {!loading && !error && messages.length === 0 && (
                        <NoResults title="Aún no hay mensajes. Sé el primero en comentar." />
                    )}
                    {!loading && messages.map((m) => {
                        if (!m?.profile_name) return null;
                        return (
                            <li key={m.id} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-custom-black capitalize">
                                    {m.profile_name}
                                </span>
                                    <span className="text-[11px] text-gray-400 ml-auto">
                                    {formatFullDateString(m.created_at)}
                                </span>
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 whitespace-pre-wrap">
                                    {m.message}
                                </p>
                            </li>
                        )
                    })}
                </ul>

                <div className="p-3 border-t border-gray-100 flex gap-2">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        className="flex-1 border border-gray-200 rounded-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !draft.trim()}
                        className="bg-primary text-white px-3 rounded-full cursor-pointer hover:bg-primary-darker disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        title="Enviar"
                    >
                        <HiPaperAirplane className="size-4 rotate-90" />
                    </button>
                </div>
            </div>
        </div>
    );
}