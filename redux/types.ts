export interface UserProfileState {
    id?:string;
    username?: string;
    avatar_url?: string;
    description?: string;
    updated_at?:string;
    created_at?:string;
    role?:string;
    birthday?:string;
}

export interface Game {
    genres?: any;
    platforms?: any;
    age_ranges?: any;
    id?: number;
    title?: string;
    description?: string;
    cover_image_url?: string;
    release_date?: string;
}

export interface Comment {
    profiles?: any;
    id?: number;
    content?: string;
    user_id?: string;
    game_id?: string;
    created_at?: string;
}

export  interface RootState {
    userProfile:UserProfileState; 
}