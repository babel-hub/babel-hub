import {useEffect, useState} from "react";
import type { CourseSchedule } from "../types/types.ts";
import {getCourseSchedule} from "../api";

export const useCourseSchedule = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [schedule, setSchedule] = useState<CourseSchedule[]>([]);

    useEffect(() => {
        if (!courseId) return;

        const controller = new AbortController();

        const fetchSchedule = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getCourseSchedule(courseId, controller.signal);
                if (!controller.signal.aborted) setSchedule(response);
            } catch (err : any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                if (!controller.signal.aborted) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Ocurrió un error al cargar los monitoreos"
                    );
                }
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();

        return () => controller.abort();
    }, [courseId]);

    return { loading, error, schedule };
}