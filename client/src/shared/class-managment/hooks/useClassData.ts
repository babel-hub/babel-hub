import { useState, useEffect } from "react";
import axios from "axios";
import type { SharedClassData } from "../types/types.ts";

type ClassFetcher = (id: string, signal?: AbortSignal) => Promise<SharedClassData>;

export const useClassData = (classId: string, fetcher: ClassFetcher) => {
    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState<SharedClassData | null>(null);

    useEffect(() => {
        if (!classId) return;

        const controller = new AbortController();

        const loadClassData = async () => {
            setLoading(true);
            try {
                const data = await fetcher(classId, controller.signal);

                if (!controller.signal.aborted) {
                    setClassData(data);
                }
            } catch (error : any) {
                if (axios.isCancel(error) || error.name === 'AbortError') return;
                console.error("Error loading class data:", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadClassData();

        return () => controller.abort();
    }, [classId, fetcher]);

    return { loading, classData };
}