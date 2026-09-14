import { useState } from "react";
import { bulkGrades } from "../../api";
import toast from "react-hot-toast";
import type { GradeRecords } from "../../../../../types";

export const useBulkAssignments = (onSuccess: () => void) => {
    const [loadingSave, setLoadingSave] = useState<boolean>(false);

    const bulkUpsertGrades = async (classId: string, assignmentId: string, records: GradeRecords[]) => {
        setLoadingSave(true);
        try {
            await bulkGrades(classId, assignmentId, records);
            toast.success("Las notas fueron cargadas correctamente");

            onSuccess();
        } catch (error : any) {
            const msg = error.response?.data?.message || "Error cargar las notas";
            console.error(msg);
            toast.error(msg);
            throw error;
        } finally {
            setLoadingSave(false);
        }
    }

    return { loadingSave, bulkUpsertGrades };
}