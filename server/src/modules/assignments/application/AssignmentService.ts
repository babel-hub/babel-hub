import type {
    IAssignmentRepository
} from "../domain/IAssignmentRepository.js";
import type { AssignmentsStructure, UpdateAssignmentDTO, CreateAssignmentPayload, GetAssignmentsOverviewPayload } from "../domain/Assignment.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../errors/domain/CustomErrors.js";
import { assertValidDueDate } from "../domain/Assignment.rules.js";
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type { IAssessmentRepository } from "../../assessmentCriteria/domain/IAssessmentRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class AssignmentService {
    constructor(
        private readonly assignmentRepository: IAssignmentRepository,
        private readonly gradeRepository: IGradeRepository,
        private readonly assessmentRepository: IAssessmentRepository
    ) {}

    async getAssignmentsOverview(
        courseId: string,
        classId: string,
        periodId: string,
        authUser: AuthUser
    ): Promise<AssignmentsStructure> {
        const auth = requireAuth(authUser);
        if (!classId || !courseId || !periodId) {
            throw new ValidationError("Los datos son inválidos");
        }

        const payload: GetAssignmentsOverviewPayload = { courseId, classId, periodId };

        const [assignments, assessments, grades] = await Promise.all([
            this.assignmentRepository.getAssignmentsOverview(payload, auth),
            this.assessmentRepository.getAssessmentByAssignment(classId, auth),
            this.gradeRepository.getGradesByClass(classId, auth)
        ]);

        const assignmentsByCriteria = new Map<string, any[]>();

        for (const asg of assignments) {
            const list = assignmentsByCriteria.get(asg.assessment_criteria_id) ?? [];
            list.push({
                id: asg.id,
                name: asg.name,
                due_date: asg.due_date,
                created_at: asg.created_at
            });
            assignmentsByCriteria.set(asg.assessment_criteria_id, list);
        }

        return {
            assessment_criteria: assessments.map(ac => ({
                id: ac.id,
                name: ac.name,
                weight: ac.weight,
                assignments: assignmentsByCriteria.get(ac.id) ?? []
            })),
            grades
        };
    }

    async createAssignment(payload: CreateAssignmentPayload, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);

        if (!payload.classId || !payload.assessmentId || !payload.periodId) {
            throw new ValidationError("Los datos de la clase, el criterio o el periodo están vacíos");
        }
        if (!payload.assignmentName || !payload.assignmentDueAt) {
            throw new ValidationError("Todos los campos obligatorios deben estar llenos");
        }

        assertValidDueDate(payload.assignmentDueAt);

        await this.assignmentRepository.createAssignment(payload, auth);
    }

    async updateAssignment(
        assignmentId: string,
        payload: UpdateAssignmentDTO,
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);

        if (!assignmentId) {
            throw new ValidationError("El ID de la asignación es obligatorio");
        }
        if (payload.assignmentName === undefined && payload.assignmentDueAt === undefined) {
            throw new ValidationError("Debe proporcionar al menos un campo para actualizar");
        }

        if (payload.assignmentDueAt) {
            assertValidDueDate(payload.assignmentDueAt);
        }

        await this.assignmentRepository.updateAssignment(assignmentId, payload, auth);
    }

    async deleteAssignment(assignmentId: string, authUser: AuthUser): Promise<void> {
        const auth = requireAuth(authUser);
        if (!assignmentId) throw new ValidationError("El ID de la asignación es obligatorio");

        const assignmentOwnerId = await this.assignmentRepository.getAssignmentOwner(assignmentId, auth);

        if (!assignmentOwnerId) {
            throw new NotFoundError("La asignación no existe");
        }

        // Both ids are profile.id — comparison is valid.
        if (auth.userRole === 'teacher' && auth.userId !== assignmentOwnerId) {
            throw new ForbiddenError("No tienes permisos para modificar esta asignación");
        }

        await this.assignmentRepository.deleteAssignment(assignmentId, auth);
    }
}