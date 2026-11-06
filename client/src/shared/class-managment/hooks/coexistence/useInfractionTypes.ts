import { useEffect, useState } from "react";
import { getInfractionTypes } from "../../api";
import type { InfractionType } from "../../types/types.ts";

export const useInfractionTypes = () => {
    const [types, setTypes] = useState<InfractionType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTypes = async () => {
            setLoading(true);
            try {
                const result = await getInfractionTypes(controller.signal);
                if (!controller.signal.aborted) setTypes(result);
            } catch {
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchTypes();
        return () => controller.abort();
    }, []);

    return { types, loading };
};