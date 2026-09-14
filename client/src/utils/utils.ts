import type { AssessmentCriteria, Assignment } from "../types";

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