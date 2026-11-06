import { useAuth } from "../../../../auth/useAuth.ts";
import { AnnouncementsManager } from "../../../../shared/announcements/components/AnnouncementsManager.tsx";

export function Announcements() {
    const { user } = useAuth();

    return (
        <AnnouncementsManager profileId={user?.profile_id || ""} courseId={null} />
    )
}