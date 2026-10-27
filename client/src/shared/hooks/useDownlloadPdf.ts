import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/client.ts";

export function useDownloadPdf() {
    const [loading, setLoading] = useState(false);

    const download = async (endpoint: string, filename: string) => {
        setLoading(true);
        try {
            const response = await api.get(endpoint, { responseType: "blob" });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();

            URL.revokeObjectURL(url);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "No se pudo generar el PDF";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return { download, loading };
}