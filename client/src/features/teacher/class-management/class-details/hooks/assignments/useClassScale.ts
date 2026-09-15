import { useState, useEffect } from "react";
import { getClassScale } from "../../api";
import type { Scales } from "../../../../../types/types.ts";

export const useClassScale = (classId: string, signal?: AbortSignal) => {
    const [scale, setScale] = useState<Scales | null>(null);
    const [loadingScale, setLoadingScale] = useState<boolean>(false);

    useEffect(() => {
        const fetchScales = async () => {
            if (!classId) return;

            setLoadingScale(true);
            try {
                const record = await getClassScale(classId, signal);
                setScale(record);
            } catch (error : any) {
                const msg = error.message || "Error al cargar las escalas de la asignatura";
                console.error(msg);
            } finally {
                setLoadingScale(false);
            }
        }
        fetchScales();
    }, [classId]);

    return { loadingScale, scale }
}