import { useState } from "react";
import {
    type AssessmentCriteria, type Assignment,
    type GradeRecords,
    reverseName
} from "../../../types";
import { AssignmentMenu } from "./ui/AssignmentMenu.tsx";
import { HiPlus } from "react-icons/hi";
import { GradeCell } from "./ui/GradeCell.tsx";
import { LuSave } from "react-icons/lu";
import toast from "react-hot-toast";
import { handleAssignmentName, suggestedComment } from "./table.utils.ts";
import type { Student } from "./table.types.ts";
import { finalGradeForStudent, toneBgandText } from "../../../utils/utils.ts";

interface DirtyCell {
    value: number;
    comment: string | null;
    isCommentEdited: boolean;
}

interface StudentGradeTableProps {
    students: Student[];
    assessments: AssessmentCriteria[];
    scale: { min: number; max: number, passing: number };
    onAddAssignment: (a: AssessmentCriteria) => void;
    onEditAssignment: (ac: AssessmentCriteria, asg: Assignment) => void;
    onDeleteAssignment: (asg: Assignment) => void;
    onSaveAssignmentGrades: (assignmentId: string, records: GradeRecords[]) => Promise<void>;
}

export function StudentGradeTable({
                                      assessments, students, scale,
                                      onAddAssignment, onDeleteAssignment, onEditAssignment, onSaveAssignmentGrades
                                  }: StudentGradeTableProps) {
    const [dirty, setDirty] = useState<Record<string, Record<string, DirtyCell>>>({});
    const [saving, setSaving] = useState<string | null>(null);

    const handleCellCommit = (assignmentId: string, studentId: string, newValue: number | null) => {
        if (typeof newValue !== "number" || Number.isNaN(newValue)) return;

        setDirty((prev) => {
            const existing = prev[assignmentId]?.[studentId];

            return {
                ...prev,
                [assignmentId]: {
                    ...(prev[assignmentId] ?? {}),
                    [studentId]: {
                        value: newValue,
                        comment: existing?.isCommentEdited
                            ? existing.comment
                            : suggestedComment(newValue, scale.min, scale.max, scale.passing),
                        isCommentEdited: existing?.isCommentEdited ?? false,
                    },
                },
            };
        });
    };

    function handleCommentCommit(assignmentId: string, studentId: string, newComment: string, fallbackValue: number | null) {
        setDirty((prev) => {
            const existing = prev[assignmentId]?.[studentId];
            const currentValue = existing?.value ?? fallbackValue;

            if (currentValue === null) return prev;

            return {
                ...prev,
                [assignmentId]: {
                    ...(prev[assignmentId] ?? {}),
                    [studentId]: { value: currentValue, comment: newComment, isCommentEdited: true }
                }
            };
        });
    }

    const handleSave = async (assignmentId: string) => {
        const changes = dirty[assignmentId];
        if (!changes) return;

        const records = Object.entries(changes).map(([studentId, data]) => ({
            studentId, value: data.value, comment: data.comment
        }));

        setSaving(assignmentId);
        try {
            await onSaveAssignmentGrades(assignmentId, records);
            setDirty((prev) => {
                const next = { ...prev };
                delete next[assignmentId];
                return next;
            });
        } catch (error : any){
            toast.error(error?.response?.data?.message || "Error al guardar las calificaciones");
        } finally {
            setSaving(null);
        }
    };

    const getDisplayValue = (assignment: Assignment, studentId: string): number | null => {
        const dirtyValue = dirty[assignment.id]?.[studentId]?.value;

        if (dirtyValue !== undefined) return dirtyValue;

        const grade = assignment.grades.find((g) => g.student_id === studentId);
        return grade ? grade.value : null;
    };

    const dirtyAssignmentIds = Object.keys(dirty);
    const hasUnsavedChanges = dirtyAssignmentIds.length > 0;

    const handleSaveAll = async () => {
        for (const assignmentId of dirtyAssignmentIds) {
            await handleSave(assignmentId);
        }
    };

    const handlePasteColumn = (assignmentId: string, startIndex: number, values: (number | null | 'invalid')[]) => {
        let applied = 0;
        let invalid = 0;

        values.forEach((val, offset) => {
            const student = students[startIndex + offset];
            if (!student) return;

            if (val === 'invalid') {
                invalid++;
                return;
            }

            handleCellCommit(assignmentId, student.student_id, val);
            applied++;
        });

        const remaining = students.length - startIndex;
        if (values.length > remaining) {
            toast.error(`Pegaste ${values.length} valores pero solo quedaban ${remaining} estudiantes. Se aplicaron ${applied}.`);
        } else if (invalid > 0) {
            toast.error(`${invalid} valor(es) no eran válidos y no se aplicaron.`);
        }
    };

    return (
        <div className="rounded-md relative">
            {hasUnsavedChanges && (
                <button
                    onClick={handleSaveAll}
                    disabled={saving !== null}
                    className="rounded-full absolute right-5 bottom-5 z-20 p-3 cursor-pointer bg-primary text-xl font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <LuSave />
                </button>
            )}

            <div className="w-full max-w-6xl overflow-auto relative no-scrollbar max-h-[calc(100dvh-15.7rem)] md:max-h-[calc(100dvh-10.9rem)]">
                <table className="w-full text-left relative min-w-max">
                    <thead className="top-0 sticky z-20 bg-white">
                        <tr className="mb-0 bg-white shadow-[inset_0_-1px_0_0_#e5e7eb]">
                            <th className="sticky left-0 z-30 bg-white p-3 border-r border-gray-200" />

                            {assessments.map((ac) => {
                                const has = ac.assignments.length > 0;
                                if (!has) {
                                    return (
                                        <th key={ac.id} onClick={() => onAddAssignment(ac)} className="cursor-pointer border-l border-gray-200 bg-gray-50 py-2 px-4 text-center align-middle transition-colors hover:bg-gray-100">
                                            <span className="block text-sm font-medium capitalize text-gray-500">{handleAssignmentName(ac.name)}</span>
                                            <span className="block text-[9px] text-gray-400">{ac.name}</span>
                                            <span className="block text-[10px] text-gray-400">{ac.weight}% · añadir asignación</span>
                                        </th>
                                    );
                                }
                                return (
                                    <th key={ac.id} colSpan={ac.assignments.length} className="border-l relative border-gray-200 bg-primary-shadow px-4 pb-2 pt-5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="text-sm font-semibold capitalize text-primary">
                                                {handleAssignmentName(ac.name)}
                                            </span>
                                            <button onClick={() => onAddAssignment(ac)} className="rounded-full p-0.5 text-primary cursor-pointer transition-colors hover:bg-primary-darker hover:text-white">
                                                <HiPlus className="size-3.5" />
                                            </button>
                                        </div>
                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-max rounded-b-md bg-primary-darker px-1.5 py-0.5 text-[8px] font-medium tabular-nums text-white">
                                            {ac.weight}%
                                        </span>
                                    </th>
                                );
                            })}
                            <th className="border-l border-gray-200 bg-primary-darker text-white p-3 text-center align-middle text-xs font-semibold uppercase tracking-wide">
                                Final
                            </th>
                        </tr>

                        <tr className="border-b border-gray-200 bg-white">
                            <th className="sticky left-0 z-30 bg-white py-2 px-3 text-sm font-semibold text-black-custom border-r border-gray-200">
                                Estudiante
                            </th>

                            {assessments.map((ac) =>
                                ac.assignments.length > 0 ? (
                                    ac.assignments.map((asg) => {
                                        const isDirty = Object.keys(dirty[asg.id] ?? {}).length > 0;
                                        return (
                                            <th key={asg.id} className="relative min-w-[72px] max-w-[72px] border-l border-gray-100 p-2 align-middle hover:bg-gray-50 transition-colors bg-white">
                                                <div className="relative w-full flex items-center group justify-center h-full">
                                            <span className={`w-full text-center truncate transition-opacity duration-200 group-hover:opacity-0 text-sm sm:text-xs font-semibold ${isDirty ? 'text-primary' : 'text-custom-black'}`} title={asg.name}>
                                                {handleAssignmentName(asg.name)}
                                            </span>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <AssignmentMenu
                                                            assessmentCriteria={ac}
                                                            assignment={asg}
                                                            onEditAssignment={onEditAssignment}
                                                            onDeleteAssignment={onDeleteAssignment}
                                                        />
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })
                                ) : (
                                    <th key={`${ac.id}-empty`} className="min-w-[72px] border-l border-gray-100 p-2 text-center text-xs text-gray-400 bg-white">—</th>
                                ),
                            )}
                            <th className="border-l border-gray-200 bg-white" />
                        </tr>
                    </thead>
                    <tbody className="relative z-0">
                        {students.map((student, index) => {
                            const displayName = reverseName({
                                firstName: student.student_first_name,
                                firstLastName: student.student_first_last_name,
                                middleName: student.student_middle_name,
                                secondLastName: student.student_second_last_name,
                            });
                            const final = finalGradeForStudent(assessments, student.student_id);

                            return (
                                <tr key={student.student_id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                                    <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-2 py-3 md:p-4">
                                        <div className="max-w-[150px] md:max-w-[220px] truncate text-sm font-medium capitalize text-gray-900">
                                            {displayName}
                                        </div>
                                    </td>

                                    {assessments.map((ac) =>
                                        ac.assignments.length > 0 ? (
                                            ac.assignments.map((asg) => {
                                                /* GradeCell logic */
                                                const dbGrade = asg.grades.find((g) => g.student_id === student.student_id);
                                                const dirtyComment = dirty[asg.id]?.[student.student_id]?.comment;
                                                const isCustomComment = dirty[asg.id]?.[student.student_id]?.isCommentEdited;
                                                const displayComment = dirtyComment !== undefined ? dirtyComment : (dbGrade?.comment ?? "");

                                                return (
                                                    <GradeCell
                                                        key={asg.id}
                                                        name={student.student_id}
                                                        value={getDisplayValue(asg, student.student_id)}
                                                        comment={{ custom: isCustomComment ?? false, comment: displayComment }}
                                                        studentName={displayName}
                                                        studentPosition={{ index, studentsObj: students.length - 1 }}
                                                        assignmentName={asg.name}
                                                        minValue={scale.min}
                                                        maxValue={scale.max}
                                                        onCommentCommit={(newComment) => handleCommentCommit(asg.id, student.student_id, newComment, dbGrade?.value ?? null)}
                                                        onCommit={(value) => handleCellCommit(asg.id, student.student_id, value)}
                                                        onPasteColumn={(values) => handlePasteColumn(asg.id, index, values)}
                                                    />
                                                )
                                            })
                                        ) : (
                                            <td key={`${ac.id}-empty`} className="p-1 text-center text-sm text-gray-300">—</td>
                                        ),
                                    )}

                                    <td className="border-l border-gray-200 bg-white px-2 text-center">
                                        <span className={`text-sm font-bold tabular-nums rounded-md px-3 py-1.5 ${toneBgandText(final, scale)}`}>
                                            {final === null ? '—' : final.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}