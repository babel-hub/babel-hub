import { useState } from "react";
import { deleteInfraction } from "../../api";
import toast from "react-hot-toast";

export const useDeleteInfraction = (onSuccess: () => void) => {
    const [loading, setLoading] = useState<boolean>(false);

    const deleteInfractionById = async (infractionId: string) => {
        setLoading(true);

        try {
            await deleteInfraction(infractionId);

            toast.success("La infracción se elimino correctamente.");
            onSuccess();
        } catch (err : any) {
            const message = err?.response?.data?.message ||
                err?.message || "No se pudo eliminar la infracción"
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return { loading, deleteInfractionById };
}