import { useEffect, useState } from "react";
import {getCourseStudents} from "../api";
import toast from "react-hot-toast";
import type { Student } from "../../../features/types/types.ts";

export const useCourseStudents = (courseId: string) => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (!courseId) return;
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getCourseStudents(courseId, controller.signal);
                if (!controller.signal.aborted) {
                    setStudents(response);
                }
            } catch (error : any) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Ocurrió un error al cargar los estudiantes";
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        return () => controller.abort();
    }, [courseId]);

    return {loading, students}
}