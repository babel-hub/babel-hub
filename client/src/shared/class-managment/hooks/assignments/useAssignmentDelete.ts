import { useState } from "react";
import { deleteAssignment } from "../../api";
import toast from "react-hot-toast";

export const useAssignmentDelete = (onSuccess: () => void) => {
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

    const deleteAssignmentById = async (id: string) => {
        if (!id) return;

        setLoadingDelete(true);
        try {
            await deleteAssignment(id);

            toast.success("Asignación eliminada correctamente");

            onSuccess();
        } catch (error : any) {
            const msg = error?.response?.data?.message || error?.message || "Error al eliminar la asignación.";
            console.error(msg);
            toast.error(msg);
        } finally {
            setLoadingDelete(false);
        }
    }

    return { loadingDelete, deleteAssignmentById };
}