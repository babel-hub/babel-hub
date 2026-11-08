import { useState } from "react";
import DynamicModalForm, { type FormField } from "../../../../components/ui/modals/ModalForm.tsx";
import { useEscalateInfraction } from "../../hooks/coexistence/useEscalateInfraction.ts";
import type { StudentInfraction } from "../../types/types.ts";

interface EscalateInfractionModalProps {
    studentInfraction: StudentInfraction;
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function EscalateInfractionModal({
                                            courseId,
                                            studentInfraction,
                                            onClose,
                                            onSuccess
                                        }: EscalateInfractionModalProps) {
    const { escalateInfractionById, loading } = useEscalateInfraction(onSuccess);

    const [formData, setFormData] = useState({
        monitoringNotes: "",
    });


    const fields: FormField[] = [
        {
            name: "monitoringNotes",
            label: "Notas de seguimiento",
            type: "textarea",
            required: true,
            rows: 3,
            placeholder: "Explica por qué este caso requiere seguimiento...",
        }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            courseId: courseId,
            monitoringNotes: formData.monitoringNotes.trim(),
            studentId: studentInfraction.student_id,
        }

        await escalateInfractionById(studentInfraction.id, payload);
    };

    return (
        <DynamicModalForm
            isOpen={true}
            title={"Escalar infracción"}
            fields={fields}
            formData={formData}
            formError={""}
            formLoading={loading}
            onClose={onClose}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    );
}