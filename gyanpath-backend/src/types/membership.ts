// Membership types
export type MembershipPlanName = 'basic' | 'premium' | 'pro';

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface MembershipPlan {
  id: string;
  name: MembershipPlanName;
  display_name: string;
  description?: string | null;
  price_inr: number;
  duration_days: number;
  benefits: MembershipBenefits;
  commission_rate: number; // 1% to 5%
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipBenefits {
  unlimited_quizzes: boolean;
  daily_quiz_limit?: number | null;
  ai_insights: boolean;
  daily_questions: number | null;
  material_discount: number; // 0 to 1 (percentage)
  ad_free: boolean;
  priority_support?: boolean;
  group_creation?: boolean;
  question_upload_limit?: number;
  notes_access?: boolean;
}

export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  status: MembershipStatus;
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_id?: string | null;
  created_at: string;
  updated_at: string;
  plan?: MembershipPlan;
}

export interface PurchaseMembershipInput {
  plan_id: string;
  auto_renew?: boolean;
}

// Question upload limits by plan (from PRD)
export const QUESTION_UPLOAD_LIMITS: Record<string, number> = {
  free: 0,
  basic: 10,
  silver: 20,
  gold: 30,
  platinum: 50,
  diamond: 100,
};
