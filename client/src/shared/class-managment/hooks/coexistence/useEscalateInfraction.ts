import { useState } from "react";
import { escalateInfraction } from "../../api";
import toast from "react-hot-toast";

export const useEscalateInfraction = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);

    const escalateInfractionById = async (infractionId: string, payload: any) => {
        setLoading(true);
        try {
            await escalateInfraction(infractionId, payload);

            toast.success("La infracción escalo a monitoreo correctamente");
            onSuccess();
        } catch (error : any) {
            const message = error?.response?.data?.message ||
                error?.message || "No se pudo escalar la infracción"
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return { loading, escalateInfractionById }
}