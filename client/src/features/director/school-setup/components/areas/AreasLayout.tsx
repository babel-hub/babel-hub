import { useAreas } from "../../../../../shared/hooks/useAreas.ts";
import { useDeleteArea } from "../../hooks/areas/useDeleteArea.ts";
import { useEffect, useRef, useState } from "react";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import type { ModalModeTypes } from "../../../../../types";
import { AreasFormModal } from "../ui/AreasFormModal.tsx";
import { HiPlus } from "react-icons/hi";
import {AreaRows} from "./AreaRows.tsx";
import type { Area } from "../../../../../shared/types/types.ts";

export function AreasLayout() {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
    const [areaToEdit, setAreaToEdit] = useState<Area | null>(null);
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');

    const { areas, reloadAreas } = useAreas();
    const { loadingDelete, deleteAreaById } = useDeleteArea(reloadAreas);

    useEffect(() => {
        if (!activeMenuId) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [activeMenuId]);

    const handleEdit = (area: Area) => {
        setAreaToEdit(area);
        setModalMode('edit');
        setActiveMenuId(null);
    };

    const handleDelete = (area: Area) => {
        setAreaToDelete(area);
        setActiveMenuId(null);
    };

    const handleCreate = () => {
        setAreaToEdit(null);
        setModalMode("create");
    };


    return (
        <div className="w-full">
            <div className="flex items-center mb-5 justify-between">
                <div className="max-w-[250px] w-full">
                    <p className="text-custom-black text-sm font-semibold">Tus áreas académicas</p>
                    <p className="text-xs text-gray-500">Cada área puede contener varias asignaturas.</p>
                </div>
                <button
                    className="cursor-pointer flex items-center gap-1 py-2 px-3 rounded-md transition-colors text-sm font-bold text-primary border hover:bg-primary-shadow hover:border-primary-shadow border-gray-100"
                    onClick={handleCreate}
                >
                    <HiPlus />
                    <p>Añadir</p>
                </button>
            </div>


            <ul className="flex flex-col gap-2">
                {areas.map((area: Area) => (
                    <AreaRows
                        key={area.id}
                        area={area}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </ul>

            <ConfirmModal
                isOpen={areaToDelete !== null}
                onClose={() => setAreaToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar la area ${areaToDelete?.name}?`}
                onConfirm={async () => {
                    if (areaToDelete) {
                        await deleteAreaById(areaToDelete.id);
                        setAreaToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== 'none' && (
                <AreasFormModal
                    mode={modalMode}
                    onSuccess={async () => {
                        setAreaToEdit(null);
                        await reloadAreas();
                        setModalMode('none');
                    }}
                    area={areaToEdit}
                    onClose={() => {
                        setAreaToEdit(null);
                        setModalMode('none');
                    }}
                />
            )}
        </div>
    );
}
