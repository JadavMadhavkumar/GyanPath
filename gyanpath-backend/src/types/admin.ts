// Admin and Audit types
export type AdminAction =
  | 'approve_question'
  | 'reject_question'
  | 'delete_question'
  | 'edit_question'
  | 'approve_video'
  | 'delete_video'
  | 'block_user'
  | 'unblock_user'
  | 'edit_user_profile'
  | 'reset_user_password'
  | 'adjust_wallet'
  | 'update_membership'
  | 'approve_refund'
  | 'reject_refund'
  | 'delete_group'
  | 'moderate_group'
  | 'create_official_quiz'
  | 'delete_quiz'
  | 'update_app_settings'
  | 'send_global_notification'
  | 'backup_database'
  | 'restore_database';

export type AdminTargetType =
  | 'user'
  | 'question'
  | 'video'
  | 'wallet'
  | 'membership'
  | 'material'
  | 'group'
  | 'quiz'
  | 'notification'
  | 'transaction'
  | 'system';

export interface AdminActionLog {
  id: string;
  admin_id: string;
  action: AdminAction;
  target_type: AdminTargetType;
  target_id: string;
  old_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateAdminActionLogInput {
  admin_id: string;
  action: AdminAction;
  target_type: AdminTargetType;
  target_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
}

// Dashboard stats
export interface DashboardStats {
  total_users: number;
  active_users_today: number;
  total_quiz_attempts_today: number;
  total_revenue_today: number;
  total_revenue_month: number;
  pending_questions: number;
  active_memberships: number;
  total_materials: number;
  total_groups: number;
  wallet_stats: {
    total_coins_in_circulation: number;
    total_cash_in_circulation: number;
    total_transactions_today: number;
  };
}

// Report types
export interface RevenueReport {
  period: {
    start: string;
    end: string;
  };
  total_revenue: number;
  membership_revenue: number;
  material_revenue: number;
  transaction_count: number;
  average_order_value: number;
  refunds: number;
  net_revenue: number;
  daily_breakdown: {
    date: string;
    revenue: number;
    transactions: number;
  }[];
}

export interface UserPerformanceReport {
  user_id: string;
  total_quiz_attempts: number;
  average_score: number;
  average_accuracy: number;
  total_coins_earned: number;
  total_study_time_minutes: number;
  subject_performance: {
    subject: string;
    attempts: number;
    average_accuracy: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  weak_areas: string[];
  strong_areas: string[];
}

export interface FraudDetectionReport {
  suspicious_users: {
    user_id: string;
    reason: string;
    risk_score: number;
    flags: string[];
  }[];
  duplicate_questions: number;
  suspicious_transactions: number;
  quiz_cheating_attempts: number;
  referral_abuse_detected: number;
}
