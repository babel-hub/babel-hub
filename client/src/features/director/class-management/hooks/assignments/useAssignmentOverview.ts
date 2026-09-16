import { useState, useEffect, useCallback } from 'react';
import { getAssignmentOverview, getClassScale } from "../../api";
import toast from "react-hot-toast";
import type { AssessmentCriteria } from "../../../../../types";
import type { Scale } from "../../../school-setup/types";

export const useAssignmentOverview = (courseId: string, classId: string, periodId: string, students: number) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [assignmentsOverview, setAssignmentsOverview] = useState<AssessmentCriteria[] | null>(null);
    const [trigger, setTrigger] = useState<number>(0);
    const [scale, setScale] = useState<Scale>();

    const refetch = useCallback(() => {
        setTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const getAssignments = async () => {
            if (!courseId || !classId || !periodId || students === 0) return;

            setLoading(true);
            try {
                const [record, scale] = await Promise.all([
                    getAssignmentOverview(courseId, classId, periodId, controller.signal),
                    getClassScale(classId, controller.signal)
                ]);

                const { assessment_criteria, grades } = record;

                const gradesByAssignment = new Map<string, any[]>();

                for (const grade of grades) {
                    const list = gradesByAssignment.get(grade.assignment_id) ?? [];
                    list.push({
                        id: grade.id,
                        student_id: grade.student_id,
                        assignment_id: grade.assignment_id,
                        value: grade.value,
                        comment: grade.comment,
                    });
                    gradesByAssignment.set(grade.assignment_id, list);
                }

                const criteriaWithGrades: AssessmentCriteria[] = assessment_criteria.map(ac => ({
                    id: ac.id,
                    name: ac.name,
                    weight: ac.weight,
                    assignments: ac.assignments.map(asg => ({
                        id: asg.id,
                        name: asg.name,
                        due_date: asg.due_date,
                        created_at: asg.created_at,
                        grades: gradesByAssignment.get(asg.id) ?? []
                    })),
                }))

                if (isMounted) {
                    setAssignmentsOverview(criteriaWithGrades);
                    setScale(scale);
                }
            } catch (error : any) {
                if (error.name === "CanceledError" || error.name === "AbortError") return;

                console.error("Error GETTING daily attendance", error);
                if (isMounted) toast.error("Error al cargar las asignaciones");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        getAssignments();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [courseId, classId, trigger, periodId, students]);

    return { assignmentsOverview, loading, refetch, scale };
}