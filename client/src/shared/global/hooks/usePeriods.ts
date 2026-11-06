import { useQuery } from "@tanstack/react-query";
import { getPeriods } from "../api";

export const usePeriods = () => {
    const {
        data: periods = [],
        isLoading: loading,
        refetch: reloadPeriods,
    } = useQuery({
        queryKey: ['periods'],
        queryFn: async () => getPeriods(),
        staleTime: 1000 * 60 * 60,
    });

    return { periods, loading, reloadPeriods };
}