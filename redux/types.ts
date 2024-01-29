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
    id?: string;
    title?: string;
    description?: string;
    cover_image_url?: string;
    release_date?: string;
    platforms?: string[];
    genres?: string[];
    developer?: string;
    publisher?: string;
}

export interface Comment {
    id?: string;
    content?: string;
    user_id?: string;
    game_id?: string;
    created_at?: string;
}

export  interface RootState {
    userProfile:UserProfileState; 
}