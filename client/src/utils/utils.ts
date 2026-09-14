import type { AssessmentCriteria, Assignment, GradeScale } from "../types";

function calcAssignmentAverage(assignments: Assignment[], studentId: string): number | null {
    let sum = 0;
    let gradedCount = 0;

    for (const assignment of assignments) {
        const grade = assignment.grades.find((g) => g.student_id === studentId);
        if (grade) {
            sum += grade.value;
            gradedCount++;
        }
    }

    if (gradedCount === 0) return null;
    return sum / gradedCount;
}

export function finalGradeForStudent(assessments: AssessmentCriteria[], studentId: string): number | null {
    let totalGrade = 0;
    let totalWeightGraded = 0;

    for (const assessment of assessments) {
        const average = calcAssignmentAverage(assessment.assignments, studentId);
        if (average === null) continue;

        const weight = assessment.weight / 100;
        totalGrade += average * weight;
        totalWeightGraded += weight;
    }

    if (totalWeightGraded === 0) return null;
    return totalGrade;
}

export function toneBgandText(value: number | null | undefined, scale: GradeScale): string {
    if (value === null || value === undefined || Number.isNaN(value) || typeof value !== "number") {
        return 'bg-gray-50';
    }

    if (value < scale.passing) return 'bg-red-50 text-red-700';

    const passingRange = scale.max - scale.passing;

    if (passingRange <= 0) return 'bg-emerald-50 text-emerald-700';

    const ratio = (value - scale.passing) / passingRange;

    if (ratio >= 0.75) return 'bg-emerald-50 text-emerald-700';
    if (ratio >= 0.33) return 'bg-lime-50 text-lime-700';

    return 'bg-amber-50 text-amber-700';
}