import { AnnouncementsFeed } from "../../../../shared/announcements/components/AnnouncementsFeed.tsx";
import { useAuth } from "../../../../auth/useAuth.ts";

export function Announcements () {
    const { user } = useAuth();

    return (
        <AnnouncementsFeed profileId={user?.profile_id || ''} courseId={null} />
    )
}