import {useState, useEffect, useCallback} from "react";
import toast from "react-hot-toast";
import { getCourseBreaks } from "../../api";
import type { CourseBreak } from "../../types";

export const useCourseBreaks = (courseId: string) => {
    const [loading, setLoading] = useState(false);
    const [breaks, setBreaks] = useState<CourseBreak[]>([]);
    const [trigger, setTrigger] = useState<number>(0);

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;

            setLoading(true);
            try {
                const response = await getCourseBreaks(courseId);
                setBreaks(response)
            } catch (error : any) {
                const msg = error.response?.data?.message || "Error al conseguir los descansos";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [courseId, trigger]);

    return { loading, breaks, refetch };
}