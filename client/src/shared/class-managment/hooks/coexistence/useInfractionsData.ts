import {useState, useEffect, useCallback} from "react";
import { getStudentInfractions } from "../../api";
import type { StudentInfraction } from "../../types/types.ts";

export const useInfractionsData = (classId: string, studentId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infractions, setInfractions] = useState<StudentInfraction[]>([]);
    const [trigger, setTrigger] = useState<number>(0);

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
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
    }, [classId, studentId, trigger]);

    return { loading, error, infractions, refetch };
};