import { useState, useEffect } from "react";
import { getUsers } from "../../api";
import type { UserSearch } from "../../types/types.ts";

export const useProfiles = (query: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [users, setUsers] = useState<UserSearch[]>([]);

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setUsers([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError("");

            try {
                const data = await getUsers(query);
                setUsers(data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message
                    || err.message
                    || "Error al buscar usuarios";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }, 1000); // 1-second debounce

        return () => clearTimeout(timeout);
    }, [query]);

    return { loading, error, users };
}