import {useState, useEffect, useCallback} from "react";
import type { StudentInfraction } from "../../class-managment/types/types.ts";
import { getStudentInfractions } from "../api";

export const useStudentInfractions = (courseId: string, studentId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [infractions, setInfractions] = useState<StudentInfraction[]>([]);
    const [trigger, setTrigger] = useState<number>(0);

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!courseId || !studentId) return;

        const controller = new AbortController();

        const fetchStudentInfractions = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getStudentInfractions(courseId, studentId, controller.signal)

                if (!controller.signal.aborted) {
                    setInfractions(response);
                }
            } catch (error : any) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Ocurrió un error al cargar las infracciones del estudiante";

                setError(errorMessage);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        fetchStudentInfractions();

        return () => controller.abort();
    }, [courseId, studentId, trigger]);

    return { infractions, loading, error , refetch };
}