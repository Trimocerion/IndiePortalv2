/**
 * Represents the state of a user profile.
 */
export interface UserProfileState {
  id?: string;
  username?: string | null;
  avatar_url?: string | null;
  description?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  role?: string | null;
  birthday?: string | null;
}

/**
 * Represents a game object.
 */
export interface Game {
  id: number;
  title?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  release_date?: string | null;
  genres?: Genre[] | null;
  platforms?: Platform[] | null;
  age_ranges?: AgeRange | null;
  favorites?: Favorite[] | null;
  ratings?: Rating[] | null;
  created_at?: string;
}

/**
 * Represents a comment object.
 */
export interface Comment {
  id?: number;
  content?: string | null;
  user_id?: string | null;
  game_id?: string;
  created_at?: string;
  profiles?: UserProfileState | null;
}

/**
 * Represents a genre object.
 */
export interface Genre {
  id: number;
  genre_name: string;
}

/**
 * Represents a platform object.
 */
export interface Platform {
  id: number;
  name: string;
}

/**
 * Represents an age range object.
 */
export interface AgeRange {
  id: number;
  age_range: string;
}

/**
 * Represents a favorite object.
 */
export interface Favorite {
  game_id: number;
  profile_id: string;
}

/**
 * Represents a rating object.
 */
export interface Rating {
  id: number;
  user_id: string;
  game_id: number;
  rating: number;
}

/**
 * Represents the root state of the Redux store.
 */
export interface RootState {
  userProfile: UserProfileState;
}