import { useState, useEffect, useCallback } from "react";
import type { Announcement } from "../../types/types.ts";
import { getAnnouncements } from "../../api";


export const useAnnouncementsData = (profileId: string, courseId: string | null) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [trigger, setTrigger] = useState<number>(0);

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (!profileId) return;

            setLoading(true);
            setError("");

            try {
                const data = await getAnnouncements(courseId, profileId);
                setAnnouncements(data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message
                    || err.message
                    || "Error al cargar los comunicados";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [trigger, profileId, courseId]);

    return { loading, error, announcements, refetch }
}