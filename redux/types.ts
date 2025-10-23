export interface UserProfileState {
    id?:any;
    username?: any;
    avatar_url?: any;
    description?: any;
    updated_at?:any;
    created_at?:any;
    role?:any;
    birthday?:any;
}

export interface Game {
    platform_ids?: any;
    age_range?: any;
    genres?: any;
    platforms?: any;
    age_ranges?: any;
    rating?: number;
    id: number;
    title?: string;
    description?: string;
    cover_image_url?: any;
    release_date?: string | null;
}

export interface Comment {
    profiles?: any;
    id?: number;
    content?: string | null;
    user_id?: string | null;
    game_id?: string;
    created_at?: string;
}

export  interface RootState {
    userProfile:UserProfileState; 
}