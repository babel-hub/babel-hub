import type {AssignmentsOverview, AssignmentsStructure, UpdateAssignmentDTO} from "../domain/Assignment.types.js";
import type { IAssignmentRepository } from "../domain/IAssignmentRepository.js";
import {ForbiddenError, UnauthorizedError, ValidationError} from "../../errors/domain/CustomErrors.js";
import { assertValidDueDate } from "../domain/Assignment.rules.js";

// From Grade Module
import type { IGradeRepository } from "../../grade/domain/IGradeRepository.js";
import type {AuthUser} from "../../shared/domain/Shared.types.js";

export class AssignmentService {
    constructor(
        private readonly assignmentRepository: IAssignmentRepository,
        private readonly gradeRepository: IGradeRepository
    ) {}
    async getAssignmentsOverview(courseId: string, classId: string, periodId: string, userSchoolId: string): Promise<AssignmentsStructure> {
        if (!classId || !courseId || !periodId) throw new ValidationError('Los datos son inválidos');

        const [overview, grades] = await Promise.all([
            this.assignmentRepository.getAssignmentsOverview(courseId, classId, periodId, userSchoolId),
            this.gradeRepository.getGradesByClass(classId)
        ]);

        return { ...overview, grades };
    }

    async createAssignment(
        assignmentName: string,
        assignmentDueAt: string,
        classId: string,
        assessmentId: string,
        periodId: string,
        authUser: AuthUser): Promise<void> {
        if (!classId || !assessmentId || !periodId) throw new ValidationError('Los datos de la clase, el criterio o el periodo están vacíos');
        if (!assignmentName || !assignmentDueAt) throw new ValidationError('Todos los campos obligatorios deben estar llenos');

        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError('Credenciales del usuario inválidas');
        }

        assertValidDueDate(assignmentDueAt);

        return this.assignmentRepository.createAssignment(assignmentName, assignmentDueAt, classId, assessmentId, periodId, authUser);
    }

    async updateAssignment(
        assignmentId: string,
        payload: UpdateAssignmentDTO,
        authUser: AuthUser): Promise<void> {
        if (!assignmentId) throw new ValidationError('los datos de la clase, criterio o asignación estan vacios');
        if (payload.assignmentName === undefined && payload.assignmentDueAt === undefined) throw new ValidationError('Debe proporcionar al menos un campo para actualizar');

        if (!authUser.userId || !authUser.userRole || !authUser.userSchoolId) {
            throw new UnauthorizedError('Credenciales del usuario inválidas');
        }

        if (payload.assignmentDueAt) {
            assertValidDueDate(payload.assignmentDueAt);
        }

        return this.assignmentRepository.updateAssignment(assignmentId, payload, authUser);
    }

    async deleteAssignment(assignmentId: string, authUser: AuthUser): Promise<void> {
        if (!authUser.userId) throw new UnauthorizedError('Credenciales inválidas');
        if (!assignmentId) throw new ValidationError('El ID de la asignación está vacío');

        const assignmentOwnerId = await this.assignmentRepository.getAssignmentOwner(assignmentId);

        if (!assignmentOwnerId) {
            throw new ValidationError('La asignación no existe');
        }

        if (authUser.userRole === 'teacher' && authUser.userId !== assignmentOwnerId) {
            throw new ForbiddenError('No tienes permisos para modificar esta asignación');
        }

        return await this.assignmentRepository.deleteAssignment(assignmentId, authUser);
    }
}