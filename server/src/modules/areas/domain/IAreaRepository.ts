import type { Area, AreaDetails } from "./Areas.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";

export interface IAreaRepository {
    getAreas(schoolId: string): Promise<Area[]>;
    getAreaDetails(id: string, schoolId: string): Promise<AreaDetails | null>;
    insertArea(name: string, authUser: AuthUser): Promise<Area>;
    updateArea(id: string, newName: string, authUser: AuthUser): Promise<Area>;
    deleteArea(id: string, authUser: AuthUser): Promise<void>;
}