import { useState } from "react";
import {deleteParentStudent} from "../../api";
import toast from "react-hot-toast";

export const useParentStudentDelete = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const deleteParentStudentById = async (linkId: string) => {
        setLoading(true);
        try {
            await deleteParentStudent(linkId);

            onSuccess();
            toast.success("Se elimino al hijo correctamente");
        } catch (error : any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return { loading, deleteParentStudentById, error };
}