import { useState, useRef, useEffect } from "react";
import { TbMessageFilled } from "react-icons/tb";
import { CommentPopup } from "./CommentPopup";

interface GradeCellProps {
    value: number | null;
    name: string;
    comment: { custom: boolean, comment: string  | null };
    studentPosition: { index: number, studentsObj: number };
    studentName: string;
    assignmentName: string;
    minValue: number;
    maxValue: number;
    onCommit: (value: number | null) => void;
    onCommentCommit: (comment: string) => void;
    onPasteColumn: (values: (number | null | 'invalid')[]) => void;
}

const REGEXP = {
    number: /^[0-9]+(\.[0-9]{1,2})?$/
};

export function GradeCell({ value, name, comment, studentPosition, onCommentCommit, assignmentName, studentName, minValue, maxValue, onCommit, onPasteColumn }: GradeCellProps) {
    const [editing, setEditing] = useState<boolean>(false);
    const [draft, setDraft] = useState<string>('');
    const [commentOpen, setCommentOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    const startEditing = () => {
        setDraft(value === null ? '' : String(value));
        setEditing(true);
    };

    const commit = () => {
        const result = parseGradeValue(draft, minValue, maxValue);
        if (result === 'invalid') {
            setEditing(false);
            return;
        }
        onCommit(result);
        setEditing(false);
        /*if (draft.trim() === '') {
            onCommit(null);
            setEditing(false);
            return;
        }

        const parsed = Number(draft);
        if (
            Number.isNaN(parsed) ||
            parsed < minValue ||
            parsed > maxValue ||
            !REGEXP.number.test(draft)
        ) {
            setEditing(false);
            return;
        }

        onCommit(parsed);
        setEditing(false);*/
    };

    function parseGradeValue(raw: string, minValue: number, maxValue: number): number | null | 'invalid' {
        const trimmed = raw.trim();
        if (trimmed === '') return null;

        const normalized = trimmed.replace(',', '.');
        if (!REGEXP.number.test(normalized)) return 'invalid';

        const parsed = Number(normalized);
        if (Number.isNaN(parsed) || parsed < minValue || parsed > maxValue) return 'invalid';
        return parsed;
    }

    if (editing) {
        return (
            <td className="p-1 text-center">
                <input
                    ref={inputRef}
                    name={name.split('-').join('').slice(0, 10)}
                    type="number"
                    min={minValue}
                    max={maxValue}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                        if (e.key === 'Escape') setEditing(false);
                        if (e.key === 'Enter') commit();
                    }}
                    aria-label={`Calificación de ${studentName} en ${assignmentName}`}
                    className="w-12 md:w-14 rounded-md border border-primary bg-background px-1 py-1.5 text-center text-sm font-medium tabular-nums outline-none ring-2 ring-primary/20"
                    onPaste={(e) => {
                        const text = e.clipboardData.getData('text');
                        const lines = text.split(/\r\n|\n|\r/).filter(Boolean);

                        if (lines.length > 1) {
                            e.preventDefault();
                            const values = lines.map(line => parseGradeValue(line, minValue, maxValue));
                            onPasteColumn(values);
                            setEditing(false);
                        }
                    }}
                />
            </td>
        );
    }

    return (
        <td className="p-1 text-center">
            <div className="flex justify-center items-center">
                <div className="relative group w-fit">
                    <button
                        onClick={startEditing}
                        aria-posinset={studentPosition.index}
                        aria-level={studentPosition.studentsObj}
                        aria-label={`Editar calificación de ${studentName} en ${assignmentName}${value === null ? ' (sin calificar)' : `: ${value}`}`}
                        className="mx-auto flex h-7 md:h-9 w-12 md:w-14 items-center justify-center rounded-md text-sm font-medium tabular-nums transition-colors group-hover:ring-2 group-hover:ring-primary/20"
                    >
                        {value === null ? '—' : value}
                    </button>

                    <button onClick={() => setCommentOpen(true)} className={`absolute -top-2  cursor-pointer -right-2 rounded-full p-0.5
                                    ${value === null ? 'hidden' : comment.custom ? 'inline' : 'lg:group-hover:inline inline lg:hidden'}
                                    ${comment.custom ? 'text-primary bg-primary/20' : 'text-gray-400 bg-gray-200'}`}>
                        <TbMessageFilled className="text-sm"/>
                    </button>

                    {commentOpen && (
                        <CommentPopup
                            initialComment={comment.comment}
                            position={studentPosition.index === studentPosition.studentsObj || studentPosition.index === studentPosition.studentsObj - 1 }
                            onSave={(newComment) => { onCommentCommit(newComment); setCommentOpen(false); }}
                            onClose={() => setCommentOpen(false)}
                        />
                    )}
                </div>
            </div>
        </td>
    );
}