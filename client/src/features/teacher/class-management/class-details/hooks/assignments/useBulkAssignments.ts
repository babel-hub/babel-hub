import { useState } from "react";
import { bulkGrades } from "../../api";
import toast from "react-hot-toast";
import type { GradeRecords } from "../../../../../../types";

export const useBulkAssignments = (onSuccess: () => void) => {
    const [loadingSave, setLoadingSave] = useState<boolean>(false);

    const bulkUpsertGrades = async (classId: string, assignmentId: string, records: GradeRecords[]) => {
        setLoadingSave(true);
        try {
            await bulkGrades(classId, assignmentId, records);
            toast.success("Las notas fueron cargadas correctamente");

            onSuccess();
        } catch (error : any) {
            console.error("Error al subir la nota", error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Error al subir la nota";

            toast.error(errorMessage);
        } finally {
            setLoadingSave(false);
        }
    }

    return { loadingSave, bulkUpsertGrades };
}