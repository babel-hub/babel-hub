import { useState } from "react";
import toast from "react-hot-toast";
import { publishInfraction } from "../api";

export const usePublishInfraction = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);

    const togglePublish = async (infractionId: string, published: boolean) => {
        setLoading(true);
        try {
            await publishInfraction(infractionId, published);
            toast.success(published ? "Publicado al acudiente" : "Ocultado del acudiente");
            onSuccess();
        } catch (error : any) {
            toast.error("Error al publicar la infracción");
        } finally {
            setLoading(false);
        }
    };

    return { togglePublish, loading };
};