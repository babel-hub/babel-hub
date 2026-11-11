import { useEffect, useState, useCallback } from "react";
import { getMonitoringMessages, createMonitoringMessage } from "../api";
import type { MonitoringMessage } from "../types/types.ts";

export const useMonitoringMessages = (monitoringId: string | null) => {
    const [messages, setMessages] = useState<MonitoringMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!monitoringId) {
            setMessages([]);
            return;
        }

        const controller = new AbortController();

        const fetch = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await getMonitoringMessages(monitoringId, controller.signal);
                if (!controller.signal.aborted) setMessages(result);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                if (!controller.signal.aborted) {
                    setError(err?.response?.data?.message || err?.message || "No se pudieron cargar los mensajes");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetch();
        return () => controller.abort();
    }, [monitoringId]);

    const send = useCallback(async (content: string) => {
        if (!monitoringId) return;
        setSending(true);
        try {
            const message = await createMonitoringMessage(monitoringId, content);
            setMessages(prev => [...prev, message]);
        } finally {
            setSending(false);
        }
    }, [monitoringId]);

    return { messages, loading, error, sending, send };
};