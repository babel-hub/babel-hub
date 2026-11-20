import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
    HiPlus, HiPencil, HiTrash, HiX,
} from "react-icons/hi";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import type {BreakGroup, CourseBreak} from "../../types";
import {deleteCourseBreakGroup} from "../../api";
import {BreakGroupFormModal} from "./BreakGroupFormModal.tsx";


interface ManageBreaksModalProps {
    courseId: string;
    courseName: string;
    breaks: CourseBreak[];
    loading: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DAY_SHORT = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatTime(t: string) {
    return t.substring(0, 5);
}

export function ManageBreaksModal({
                                      courseId,
                                      courseName,
                                      breaks,
                                      loading,
                                      onClose,
                                      onSuccess,
                                  }: ManageBreaksModalProps) {
    const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
    const [groupToEdit, setGroupToEdit] = useState<BreakGroup | null>(null);
    const [deletingGroup, setDeletingGroup] = useState<BreakGroup | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Group the flat rows into logical break groups
    const groups = useMemo<BreakGroup[]>(() => {
        const map = new Map<string, BreakGroup>();
        for (const b of breaks) {
            const key = `${b.name}|${b.start_time}|${b.end_time}`;
            if (!map.has(key)) {
                map.set(key, {
                    name: b.name,
                    start_time: b.start_time,
                    end_time: b.end_time,
                    ids: [],
                    days: [],
                });
            }
            const g = map.get(key)!;
            g.ids.push(b.id);
            g.days.push(b.day_of_week);
        }
        return Array.from(map.values()).map(g => ({
            ...g,
            days: [...new Set(g.days)].sort((a, b) => a - b),
        }));
    }, [breaks]);

    const handleDelete = async () => {
        if (!deletingGroup) return;
        setDeleting(true);
        try {
            await deleteCourseBreakGroup(courseId, deletingGroup.ids);
            toast.success(`"${deletingGroup.name}" eliminado`);
            setDeletingGroup(null);
            onSuccess();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-100">
                        <div>
                            <h3 className="text-xl pl-2 font-bold text-custom-black">
                                Descansos
                            </h3>
                            <p className="text-xs pl-2 text-gray-500 mt-0.5 capitalize">
                                Curso {courseName}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-500 p-1"
                        >
                            <HiX className="size-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-3 overflow-y-auto flex-1">
                        {loading ? (
                            <LoadingContent title="" />
                        ) : groups.length === 0 ? (
                            <NoResults title="Aún no hay descansos configurados" />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {groups.map((g) => (
                                    <li
                                        key={g.ids[0]}
                                        className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm text-custom-black capitalize">
                                                {g.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatTime(g.start_time)} – {formatTime(g.end_time)}
                                            </p>
                                            <div className="flex gap-1 mt-1.5 flex-wrap">
                                                {g.days.map((d) => (
                                                    <span
                                                        key={d}
                                                        className="text-[10px] font-semibold uppercase tracking-wide bg-primary-shadow text-primary px-1.5 py-0.5 rounded"
                                                    >
                                                        {DAY_SHORT[d]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => {
                                                    setGroupToEdit(g);
                                                    setFormMode("edit");
                                                }}
                                                className="text-gray-400 hover:text-primary hover:bg-gray-50 p-1.5 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <HiPencil className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingGroup(g)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <HiTrash className="size-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-3 border-t border-gray-100 pt-3">
                        <button
                            onClick={() => {
                                setGroupToEdit(null);
                                setFormMode("create");
                            }}
                            className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <HiPlus className="size-4" />
                            Agregar descanso
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested form modal */}
            {formMode !== "none" && (
                <BreakGroupFormModal
                    courseId={courseId}
                    mode={formMode}
                    group={groupToEdit}
                    onClose={() => {
                        setFormMode("none");
                        setGroupToEdit(null);
                    }}
                    onSuccess={() => {
                        setFormMode("none");
                        setGroupToEdit(null);
                        onSuccess();
                    }}
                />
            )}

            {/* Delete confirm */}
            {deletingGroup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
                    onClick={() => !deleting && setDeletingGroup(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-custom-black mb-2">
                            ¿Eliminar descanso?
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Se eliminará <b>"{deletingGroup.name}"</b> de los días{" "}
                            {deletingGroup.days.map(d => DAY_SHORT[d]).join(", ")}.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingGroup(null)}
                                disabled={deleting}
                                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:opacity-50"
                            >
                                {deleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}