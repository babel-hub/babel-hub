import { useQuery } from "@tanstack/react-query";
import { getScales } from "../api";

export const useScales = () => {
    const {
        data: scales = [],
        isLoading: loading,
        refetch: reloadScales,
    } = useQuery({
        queryKey: ['scales'],
        queryFn: async () => getScales(),
        staleTime: 1000 * 60 * 60,
    });

    return { scales, loading, refetch: reloadScales };
}