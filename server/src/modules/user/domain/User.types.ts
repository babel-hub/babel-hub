export type UserProfileResponse = {
    id: string;
    first_name: string;
    middle_name: string;
    first_last_name: string;
    second_last_name: string;
    role: string;
    email: string;
    is_active: boolean;
    school_id: string | null;
    profile_id: string | null;
    is_profile_complete: boolean;
};

export interface UserSearch {
    id: string;
    first_name: string;
    middle_name: string;
    first_last_name: string;
    second_last_name: string;
    role: string;
}