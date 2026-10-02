import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { useState } from "react";
import type { ModalModeTypes } from "../../../../../types";
import {AnnouncementModalForm} from "../ui/AnnouncementModalForm.tsx";

export function Announcements() {
    const navigate = useNavigate();

    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');

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
                        setModalMode("create");
                    }}
                    title="Nuevo comunicado"
                />
            </div>

            <div className="bg-white md:rounded-xl md:border md:border-gray-100 p-4">
                {/* Here goes the table of the announcements */}
            </div>

            {modalMode !== "none" && (
                <AnnouncementModalForm
                    mode={modalMode}
                    onClose={() => setModalMode("none")}
                    onSuccess={() => alert()}
                    announcement={undefined}
                />
            )}
        </div>
    )
}