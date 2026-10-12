import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {Area, AreaDetails, CreateAreaPayload, UpdateAreaPayload} from "./Areas.types.js";

export interface IAreaRepository {
    getAreas(authUser: AuthUser): Promise<Area[]>;
    getAreaDetails(id: string, authUser: AuthUser): Promise<Area | null>;
    insertArea(payload: CreateAreaPayload, authUser: AuthUser): Promise<void>;
    updateArea(payload: UpdateAreaPayload, authUser: AuthUser): Promise<void>;
    deleteArea(id: string, authUser: AuthUser): Promise<void>;
}