import { useState, useEffect } from "react";
import type { StudentInfraction } from "../../../../types/types.ts";
import { getStudentInfractions } from "../../api";

export const useInfractionsData = (classId: string, studentId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infractions, setInfractions] = useState<StudentInfraction[]>([]);

    useEffect(() => {
        console.log(classId, studentId);

        if (!classId || !studentId) {
            setInfractions([]);
            return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getStudentInfractions(classId, studentId, controller.signal);
                if (!controller.signal.aborted) setInfractions(response);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                if (!controller.signal.aborted) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Ocurrió un error al cargar las infracciones"
                    );
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [classId, studentId]);

    return { loading, error, infractions };
};