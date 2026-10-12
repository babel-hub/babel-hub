import type {
    IGradeRepository
} from "../domain/IGradeRepository.js";
import type {
    GradeByAssignment,
    GradeRecord,
    StudentDailyGrade,
    GetAccumulatedGradesBySubjectPayload,
    BulkUpsertGradesPayload,
    StudentGrade,
    SubjectAccumulated
} from "../domain/Grade.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { ValidationError } from "../../errors/domain/CustomErrors.js";
import { validateGrade } from "../domain/Grade.rules.js";
import type { IScalesRepository } from "../../scales/domain/IScalesRepository.js";
import { requireAuth } from "../../shared/auth/requireAuth.js";

export class GradeService {
    constructor(
        private readonly gradeRepository: IGradeRepository,
        private readonly scaleRepository: IScalesRepository
    ) {}

    async bulkUpsertGrades(
        classId: string,
        assignmentId: string,
        records: GradeRecord[],
        authUser: AuthUser
    ): Promise<void> {
        const auth = requireAuth(authUser);

        if (!assignmentId) throw new ValidationError("El ID de la asignación no está siendo enviado");
        if (!records || records.length === 0) {
            throw new ValidationError("No hay calificaciones por guardar");
        }

        const scales = await this.scaleRepository.getClassScale(classId, auth);

        for (const record of records) {
            if (!record.studentId || record.value === undefined || record.value === null) {
                throw new ValidationError("Faltan campos obligatorios en una o más calificaciones");
            }
            validateGrade(scales, record.value);
        }

        const payload: BulkUpsertGradesPayload = { assignmentId, records };
        await this.gradeRepository.bulkUpsertGrades(payload, auth);
    }
}