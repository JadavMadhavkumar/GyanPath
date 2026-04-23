// Export all types
export * from './user';
export * from './wallet';
export * from './membership';
export * from './quiz';
export * from './material';
export * from './notification';
export * from './ai';
export * from './payment';
export * from './community';
export * from './admin';

// Subject type
export interface Subject {
  id: string;
  name: string;
  display_name: string;
  display_name_hi?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// User streak type
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string | null;
  streak_type: 'daily_question' | 'quiz' | 'login';
  created_at: string;
  updated_at: string;
}

// Referral types
export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_coins: number;
  created_at: string;
  rewarded_at?: string | null;
}

// Institution types (for admission discovery)
export type InstitutionType = 'school' | 'college' | 'university';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  description?: string | null;
  address?: string | null;
  city: string;
  state: string;
  pincode?: string | null;
  website?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  facilities?: string[] | null;
  hostel_available?: boolean | null;
  fees_range?: string | null;
  admission_open: boolean;
  application_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

// Accommodation types (PG, Hostel, Room)
export type AccommodationType = 'pg' | 'hostel' | 'room';

export interface AccommodationListing {
  id: string;
  title: string;
  type: AccommodationType;
  description?: string | null;
  owner_id: string;
  address?: string | null;
  city: string;
  state: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price_min: number;
  price_max?: number | null;
  facilities?: string[] | null;
  distance_to_college_km?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Career types
export interface CareerPath {
  id: string;
  name: string;
  description?: string | null;
  required_skills?: string[] | null;
  suggested_courses?: string[] | null;
  average_salary?: string | null;
  growth_outlook?: string | null;
  created_at: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description?: string | null;
  type: 'full_time' | 'part_time' | 'internship' | 'contract';
  location: string;
  remote_available: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  required_skills?: string[] | null;
  experience_required_years?: number | null;
  application_deadline?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeProfile {
  id: string;
  user_id: string;
  objective?: string | null;
  education: {
    institution: string;
    degree: string;
    field: string;
    year: number;
    grade?: string;
  }[];
  skills: string[];
  experience: {
    company: string;
    role: string;
    start_date: string;
    end_date?: string | null;
    description?: string;
  }[];
  projects: {
    name: string;
    description: string;
    url?: string;
  }[];
  updated_at: string;
}
