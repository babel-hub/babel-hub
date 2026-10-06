import { useNavigate } from "react-router-dom";
import { useAnnouncementsData } from "../../hooks/announcements/useAnnouncementsData.ts";
import ButtonChevronBack from "../../../components/ui/buttons/ButtonChevrowBack.tsx";
import {  AnnouncementCard  } from "./ui/AnnouncementCard.tsx";
import { LoadingPage } from "../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../components/ui/blocks/NoResults.tsx";
import {  useState  } from "react";
import { AnnouncementModal } from "../../../components/ui/modals/AnnouncementModal.tsx";
import type { Announcement } from "../../types/types.ts";


interface AnnouncementsFeedProps {
    profileId: string;
    courseId: string | null;
}

export function AnnouncementsFeed({ profileId, courseId }: AnnouncementsFeedProps) {
    const navigate = useNavigate();
    const { announcements, loading } = useAnnouncementsData(profileId, courseId);

    const [announcementModalOpen, setAnnouncementModalOpen] = useState<Announcement | null>(null);

    if (loading) return <LoadingPage title="" />;
    if (loading && announcements.length === 0 ) return <NoResults title="No hay comunicados para mostrar"/>

    return (
        <div className="flex flex-col h-full w-full md:gap-4">
            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4 flex items-center gap-4">
                <ButtonChevronBack onClick={() => navigate(-1)} />
                <h1 className="text-xl md:text-2xl capitalize font-bold text-custom-black">
                    Comunicados
                </h1>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-100 p-2 overflow-y-auto">
                {!loading && announcements.length > 0 && (
                    <div className="flex flex-col h-full w-full">
                        {
                            announcements.map((announcement) => (
                                <AnnouncementCard
                                    onClick={() => {
                                        setAnnouncementModalOpen(announcement);
                                    }}
                                    announcement={announcement}
                                />
                            ))
                        }
                    </div>
                )}
            </div>

            {announcementModalOpen && (
                <AnnouncementModal
                    announcement={announcementModalOpen}
                    onClose={() => setAnnouncementModalOpen(null)}
                />
            )}
        </div>
    );
}