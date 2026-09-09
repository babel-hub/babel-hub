import { useState } from "react";
import {
    type AssessmentCriteria,
    type Assignment,
    finalGradeForStudent,
    type GradeRecords,
    type Student,
    toneBgandText,
    reverseName,
    suggestedComment
} from "../../../types";
import { AssignmentMenu } from "./ui/AssignmentMenu.tsx";
import { HiPlus } from "react-icons/hi";
import { GradeCell } from "./ui/GradeCell.tsx";
import { LuSave } from "react-icons/lu";
import toast from "react-hot-toast";

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
        } catch {

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

            <div className="w-full overflow-auto relative no-scrollbar">
                <table className="w-full text-left relative border-collapse min-w-max">
                    <thead>
                    <tr className="border-y border-gray-200">
                        <th className="sticky left-0 z-10 bg-white p-3" />
                        {assessments.map((ac) => {
                            const has = ac.assignments.length > 0;
                            if (!has) {
                                return (
                                    <th
                                        key={ac.id}
                                        onClick={() => onAddAssignment(ac)}
                                        className="cursor-pointer border-l border-gray-200 bg-gray-50 py-2 px-4 text-center align-middle transition-colors hover:bg-gray-100"
                                    >
                                        <span className="block text-sm font-medium capitalize text-gray-500">{ac.name}</span>
                                        <span className="mt-0.5 block text-[10px] text-gray-400">
                                                {ac.weight}% · añadir asignación
                                            </span>
                                    </th>
                                );
                            }
                            return (
                                <th key={ac.id} colSpan={ac.assignments.length} className="border-l border-gray-200 bg-primary-shadow p-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className="text-sm font-semibold capitalize text-primary">{ac.name}</span>
                                        <span className="rounded-full bg-transparent border border-primary px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-primary">
                                                {ac.weight}%
                                        </span>
                                        <button
                                            onClick={() => onAddAssignment(ac)}
                                            aria-label={`Añadir asignación a ${ac.name}`}
                                            className="rounded-full p-1 text-primary cursor-pointer transition-colors hover:bg-primary/20"
                                        >
                                            <HiPlus className="size-3.5" />
                                        </button>
                                    </div>
                                </th>
                            );
                        })}
                        <th className="border-l border-gray-200 bg-white p-3 text-center align-middle text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Final
                        </th>
                    </tr>

                    <tr className="border-b-2 border-primary-shadow">
                        <th className="sticky left-0 z-10 bg-white py-2 px-3 text-sm font-semibold text-black-custom">Estudiante</th>
                        {assessments.map((ac) =>
                            ac.assignments.length > 0 ? (
                                ac.assignments.map((asg, i) => {
                                    const isDirty = Object.keys(dirty[asg.id] ?? {}).length > 0;
                                    return (
                                        <th
                                            key={asg.id}
                                            className="group relative min-w-[72px] border-l border-gray-100 p-2 align-top"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                {isDirty && (
                                                    <span
                                                        className="size-1 rounded-full bg-primary"
                                                        title="Cambios sin guardar"
                                                    />
                                                )}

                                                <span
                                                    className={`max-w-[42px] truncate text-sm sm:text-xs font-semibold ${isDirty ? 'text-primary' : 'text-custom-black'}`}
                                                    title={asg.name}
                                                >
                                                        {`${asg.name.split(" ")[0].charAt(0).toUpperCase()}${i + 1}`}
                                                    </span>

                                                <AssignmentMenu
                                                    assessmentCriteria={ac}
                                                    assignment={asg}
                                                    onEditAssignment={onEditAssignment}
                                                    onDeleteAssignment={onDeleteAssignment}
                                                />
                                            </div>
                                        </th>
                                    );
                                })
                            ) : (
                                <th key={`${ac.id}-empty`} className="min-w-[72px] border-l border-gray-100 p-2 text-center text-xs text-gray-400">—</th>
                            ),
                        )}
                        <th className="border-l border-gray-200 bg-white" />
                    </tr>
                    </thead>
                    <tbody>
                    {students.map((student, index, studentsObj) => {
                        const displayName = reverseName({
                            firstName: student.first_name,
                            firstLastName: student.first_last_name,
                            middleName: student.middle_name,
                            secondLastName: student.second_last_name,
                        });
                        const final = finalGradeForStudent(assessments, student.student_id);
                        return (
                            <tr key={student.student_id} className="border-t border-gray-100 transition-colors hover:bg-gray-50">
                                <td className="sticky left-0 border-r z-10 border-gray-200 bg-white px-2 py-3 md:p-3">
                                    <div className="max-w-[150px] md:max-w-[220px] truncate text-sm font-medium capitalize text-gray-900">{displayName}</div>
                                    <div className="truncate text-xs text-gray-500">{student.email}</div>
                                </td>

                                {assessments.map((ac) =>
                                    ac.assignments.length > 0 ? (
                                        ac.assignments.map((asg) => {
                                            const dbGrade = asg.grades.find((g) => g.student_id === student.student_id);

                                            const dirtyComment = dirty[asg.id]?.[student.student_id]?.comment;
                                            const isCustomComment = dirty[asg.id]?.[student.student_id]?.isCommentEdited;
                                            const displayComment = dirtyComment !== undefined ? dirtyComment : (dbGrade?.comment ?? "");

                                            return (
                                                <GradeCell
                                                    key={asg.id}
                                                    name={student.student_id}
                                                    value={getDisplayValue(asg, student.student_id)}
                                                    comment={{ custom: isCustomComment, comment: displayComment }}
                                                    studentName={displayName}
                                                    studentPosition={{ index, studentsObj: studentsObj.length - 1 }}
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

                                <td className="border-l border-gray-200 bg-white text-center">
                                        <span className={`text-sm font-bold tabular-nums rounded-md px-3 py-1.5 ${toneBgandText(final, scale)}`}>
                                            {final === null ? '—' : final.toFixed(1)}
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