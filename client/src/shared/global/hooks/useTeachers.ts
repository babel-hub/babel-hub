import { useQuery } from "@tanstack/react-query";
import { getTeachers } from "../api";

export const useTeachers = () => {
    const {
        data: teachers = [],
        isLoading: loading,
        refetch: reload,
    } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => await getTeachers(),
        staleTime: 1000 * 60 * 15,
    });

    return { teachers, reload, loading };
}