export interface UserProfileState {
    id?:string;
    username?: any;
    avatar_url?: any;
    description?: any;
    updated_at?:any;
    created_at?:any;
    role?:any;
    birthday?:any;
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