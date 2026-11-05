import { useState, useEffect } from "react";
import type { StudentMonitoring } from "../../../../types/types.ts";
import { getStudentMonitoring } from "../../api";

export const useMonitoringData = (courseId: string, studentId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [monitoring, setMonitoring] = useState<StudentMonitoring[]>([]);

    useEffect(() => {
        if (!courseId || !studentId) {
            setMonitoring([]);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getStudentMonitoring(courseId, studentId, controller.signal);
                if (!controller.signal.aborted) setMonitoring(response);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                if (!controller.signal.aborted) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Ocurrió un error al cargar los monitoreos"
                    );
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [courseId, studentId]);

    return { loading, error, monitoring };
};