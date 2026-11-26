import { useEffect, useState } from "react";
import { getPrincipalDashboard } from "../api";
import type { PrincipalDashboardData } from "../types/types.ts";

export const usePrincipalDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dashboard, setDashboard] = useState<PrincipalDashboardData | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const fetchDashboard = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getPrincipalDashboard(controller.signal);
                if (!controller.signal.aborted) setDashboard(response);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                if (!controller.signal.aborted) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "No se pudo cargar el dashboard"
                    );
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchDashboard();

        return () => controller.abort();
    }, [refreshKey]);

    const refetch = () => setRefreshKey(k => k + 1);

    return { loading, error, dashboard, refetch };
};