import { useState } from 'react';
import { createClass, createClassSchedule, updateClass } from "../../api";
import toast from "react-hot-toast";
import type { modeTypes } from "../../../../types/types.ts";

export const useUpsertClass = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const upsertClass = async (mode: modeTypes, id: string | undefined, payload: any) => {
        setLoading(true);
        setError("");

        try {
            if (mode === "edit" && id) {
                await updateClass(id, payload);
                toast.success("Clase editada correctamente.");
                onSuccess();
                return;
            }

            if (mode === "create") {
                const classId = await createClass({
                    courseId: payload.courseId,
                    subjectId: payload.subjectId,
                    teacherId: payload.teacherId,
                });

                const schedules = payload.schedules ?? [];

                if (schedules.length > 0) {
                    try {
                        await createClassSchedule(classId, schedules);
                        toast.success("Clase y horario creados correctamente.");
                    } catch (scheduleErr: any) {
                        const msg =
                            scheduleErr?.response?.data?.message ||
                            "conflicto con otro horario existente";

                        toast.error(
                            `Clase creada, pero el horario falló: ${msg}. ` +
                            `Puedes agregarlo después desde el menú de la clase.`,
                            { duration: 7000 }
                        );
                    }
                } else {
                    toast.success("Clase creada correctamente.");
                }

                onSuccess();
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                `Error al ${mode === "create" ? "crear" : "editar"} la clase.`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, upsertClass };
};