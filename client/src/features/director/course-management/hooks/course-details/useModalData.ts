import { useState, useEffect } from 'react';
import { getAvailableSubjects } from "../../api";
import { useTeachers } from "../../../../../shared/global/hooks/useTeachers.ts";
import type { AvailableSubjects } from "../../types";

export const useModalData = (id: string) => {
    const [subjects, setSubjects] = useState<AvailableSubjects[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { teachers } = useTeachers();

    useEffect(() => {
        const loadModalData =  async () => {
            if (!id) return;

            setLoading(true);
            try {
                const availableSubjects = await getAvailableSubjects(id);
                setSubjects(availableSubjects);
            } catch (error : any) {
                console.error("Error GETTING modal data", error);
            } finally {
                setLoading(false);
            }
        }
        loadModalData();
    }, [id]);

    return { teachers, subjects, loading };
}