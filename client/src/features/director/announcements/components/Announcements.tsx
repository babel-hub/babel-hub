import { useAuth } from "../../../../auth/useAuth.ts";
import { AnnouncementsManager } from "../../../../shared/components/announcements/AnnouncementsManager.tsx";

export function Announcements() {
    const { user } = useAuth();

    return (
        <AnnouncementsManager profileId={user?.profile_id || ""} courseId={null} />
    )
}