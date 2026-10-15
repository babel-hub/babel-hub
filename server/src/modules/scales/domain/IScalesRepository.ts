import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { Scale } from "./Scales.types.js";

export interface IScalesRepository {
    getScales(authUser: AuthUser): Promise<Scale[]>;
    getClassScale(classId: string, authUser: AuthUser): Promise<Scale>;
}