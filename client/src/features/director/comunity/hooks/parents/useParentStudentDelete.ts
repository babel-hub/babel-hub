import { useState } from "react";
import {deleteParentStudent} from "../../api";
import toast from "react-hot-toast";

export const useParentStudentDelete = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);

    const deleteParentStudentById = async (linkId: string) => {
        setLoading(true);
        try {
            await deleteParentStudent(linkId);

            onSuccess();
            toast.success("Se elimino al hijo correctamente");
        } catch (error : any) {
            console.log(error);
            toast.error(error.message || "Error al eliminar el estudiante");
        } finally {
            setLoading(false);
        }
    }

    return { loading, deleteParentStudentById };
}