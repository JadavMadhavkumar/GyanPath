// Membership types
export interface MembershipPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_inr: number;
  duration_days: number;
  benefits: MembershipBenefits;
  commission_rate: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipBenefits {
  unlimited_quizzes: boolean;
  daily_quiz_limit: number | null;
  ai_insights: boolean;
  daily_questions: number | null;
  material_discount: number;
  ad_free: boolean;
  priority_support?: boolean;
}

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  status: MembershipStatus;
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  plan?: MembershipPlan;
}
