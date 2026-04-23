// User types
export type UserRole = 'guest' | 'student' | 'member' | 'contributor' | 'admin';
export type Language = 'en' | 'hi' | 'both';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  class: string | null;
  subjects: string[];
  language: Language;
  is_verified: boolean;
  is_blocked: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends Pick<User, 
  'id' | 'full_name' | 'avatar_url' | 'class' | 'subjects' | 'language'
> {}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_type: 'daily_question' | 'quiz' | 'login';
  created_at: string;
  updated_at: string;
}
