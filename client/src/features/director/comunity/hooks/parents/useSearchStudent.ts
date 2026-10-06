import { useEffect, useState } from "react";
import type { StudentSearchResult } from "../../types";
import { getStudentsByName } from "../../api";

export const useStudentSearch = (query: string) => {
    const [students, setStudents] = useState<StudentSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setStudents([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await getStudentsByName(query);
                setStudents(data);
            } catch (error) {
                console.error("Error searching students:", error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [query]);

    return { students, loading };
};