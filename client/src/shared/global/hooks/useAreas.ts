import { useQuery } from "@tanstack/react-query";
import { getAreas } from "../api";

export const useAreas = () => {
    const {
        data: areas = [],
        isLoading: loading,
        refetch: reloadAreas,
    } = useQuery({
        queryKey: ['areas'],
        queryFn: async () => getAreas(),
        staleTime: 1000 * 60 * 60,
    });

    return { areas, loading, reloadAreas };
}