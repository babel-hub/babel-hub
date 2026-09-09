import { useState } from 'react';
import { createTeacher, updateTeacher} from "../../api";
import toast from "react-hot-toast";
import type { modeTypes } from "../../../../types/types.ts";
import type { CreateTeacher } from "../../types";

export const useTeacherSubmit = (onSuccess: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const teacherSubmit = async (mode: modeTypes, teacherId: string | null, payload: CreateTeacher) => {
        setLoading(true);
        try {
            if (mode === "edit" && teacherId) {
                await updateTeacher(teacherId, payload);
            } else if (mode === "create") {
                await createTeacher(payload);
            }
            toast.success(`Profesor ${mode === 'create' ? 'creado' : 'editado'} correctamente`)

            onSuccess();
        } catch (error : any) {
            const msg = error.response?.data?.message || "Error al guardar el profesor."
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return { teacherSubmit, error, setError, loading };
}