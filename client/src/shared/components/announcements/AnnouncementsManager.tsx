import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ModalModeTypes } from "../../../types";
import type { Announcement } from "../../types/types.ts";
import { useAnnouncementsData } from "../../hooks/announcements/useAnnouncementsData.ts";
import { useDeleteAnnouncement } from "../../hooks/announcements/useDeleteAnnouncement.ts";
import ButtonChevronBack from "../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { PrimaryButton } from "../../../components/ui/buttons/Buttons.tsx";
import { AnnouncementModalForm } from "./ui/AnnouncementsModalForm.tsx";
import { AnnouncementsList } from "./ui/AnnouncementsTable.tsx";
import {AnnouncementModal} from "../../../components/ui/modals/AnnouncementModal.tsx";

interface AnnouncementsManagerProps {
    profileId: string;
    courseId: string | null;
}

export function AnnouncementsManager({ profileId, courseId }: AnnouncementsManagerProps) {
    const navigate = useNavigate();

    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined);
    const [announcementModalOpen, setAnnouncementModalOpen] = useState<Announcement | null>(null);


    const { announcements, refetch, loading } = useAnnouncementsData(profileId, courseId);
    const { deleteAnnouncementById } = useDeleteAnnouncement(refetch);

    const handleEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setModalMode("edit");
    };

    const handleDelete = async (announcement: Announcement) => {
        if (window.confirm("¿Estás seguro de eliminar este comunicado?")) {
            await deleteAnnouncementById(announcement.id);
        }
    };

    const handleCloseModal = () => {
        setModalMode("none");
        setSelectedAnnouncement(undefined);
    };

    const handleView = (announcement: Announcement) => {
        setAnnouncementModalOpen(announcement)
    }

    return (
        <div className="flex flex-col h-full w-full md:gap-3">
            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4 flex flex-col sm:flex-row items-start gap-3 sm:items-center sm:justify-between">
                <div className="flex gap-4 items-center">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <div>
                        <h1 className="text-xl md:text-1xl xl:text-2xl capitalize font-bold text-custom-black">
                            Comunicados
                        </h1>
                    </div>
                </div>
                <PrimaryButton
                    full={false}
                    onClick={() => {
                        setSelectedAnnouncement(undefined);
                        setModalMode("create");
                    }}
                    title="Nuevo comunicado"
                />
            </div>

            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Cargando comunicados...</div>
                ) : (
                    <AnnouncementsList
                        announcements={announcements}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                )}
            </div>

            {modalMode !== "none" && (
                <AnnouncementModalForm
                    mode={modalMode}
                    onClose={handleCloseModal}
                    onSuccess={() => {
                        refetch();
                        handleCloseModal();
                    }}
                    announcement={selectedAnnouncement}
                />
            )}

            {announcementModalOpen && (
                <AnnouncementModal
                    announcement={announcementModalOpen}
                    onClose={() => setAnnouncementModalOpen(null)}
                />
            )}
        </div>
    );
}