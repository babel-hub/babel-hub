import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type { Scales } from "./Scales.types.js";

export interface IScalesRepository {
    getScales(authUser: AuthUser): Promise<Scales[]>;
    getClassScale(classId: string, authUser: AuthUser): Promise<Scales>;
}