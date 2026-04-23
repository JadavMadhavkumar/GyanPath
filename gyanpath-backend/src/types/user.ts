// User roles
export type UserRole = 'guest' | 'student' | 'member' | 'contributor' | 'admin';

// User language preferences
export type UserLanguage = 'en' | 'hi' | 'both';

// User profile extending Supabase auth user
export interface User {
  id: string; // UUID, references auth.users(id)
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  class?: string | null; // e.g., '10th', '12th', 'graduate'
  subjects?: string[] | null; // array of subject interests
  language: UserLanguage;
  is_verified: boolean;
  is_blocked: boolean;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;
}

// User profile update input
export interface UpdateUserProfileInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  class?: string;
  subjects?: string[];
  language?: UserLanguage;
}

// User registration input
export interface RegisterUserInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  class?: string;
  subjects?: string[];
  language?: UserLanguage;
  career_interests?: string[];
  study_goals?: string;
}

// User login input
export interface LoginUserInput {
  email: string;
  password: string;
}

// User search params (admin)
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  class?: string;
  membership_status?: 'active' | 'expired' | 'none';
  is_blocked?: boolean;
  page?: number;
  limit?: number;
}
