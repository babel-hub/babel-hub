import type { IAreaRepository } from "../domain/IAreaRepository.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../errors/domain/CustomErrors.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import {validateName} from "../domain/Area.rules.js";

export class AreaService {
    constructor(private readonly areasRepository: IAreaRepository) {}

    async getAreas(schoolId: string) {
        if (!schoolId) throw new UnauthorizedError('Falta el ID del colegio.');

        return this.areasRepository.getAreas(schoolId);
    }

    async getAreaDetails(id: string, schoolId: string) {
        if (!schoolId) throw new UnauthorizedError('Falta el ID del colegio.');
        if (!id) throw new ValidationError('El ID del área es obligatorio.');

        const area = await this.areasRepository.getAreaDetails(id, schoolId);

        if (!area) throw new NotFoundError(`No se encontró el área solicitada.`);

        return area;
    }

    async createArea(name: string, authUser: AuthUser) {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError('Credenciales de usuario inválidas o incompletas.');
        const newName = validateName(name);

        return this.areasRepository.insertArea(newName, authUser);
    }

    async updateArea(id: string, newName: string, authUser: AuthUser) {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError('Credenciales de usuario inválidas o incompletas.');
        if (!id) throw new ValidationError('El ID del área es obligatorio.');
        const name = validateName(newName);

        return this.areasRepository.updateArea(id, name, authUser);
    }

    async deleteArea(id: string, authUser: AuthUser) {
        if (!authUser || !authUser.userId || !authUser.userRole || !authUser.userSchoolId) throw new UnauthorizedError('Credenciales de usuario inválidas o incompletas.');
        if (!id) throw new ValidationError('El ID del área es obligatorio.');

        return this.areasRepository.deleteArea(id, authUser);
    }
}