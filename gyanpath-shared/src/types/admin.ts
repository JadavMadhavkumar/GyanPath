// Admin types
export interface AdminActionLog {
  id: string;
  admin_id: string;
  action: AdminAction;
  target_type: AdminTargetType;
  target_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export type AdminAction =
  | 'approve_question'
  | 'reject_question'
  | 'delete_question'
  | 'block_user'
  | 'unblock_user'
  | 'update_user'
  | 'reset_password'
  | 'adjust_wallet'
  | 'approve_refund'
  | 'update_membership'
  | 'delete_material'
  | 'send_notification'
  | 'update_settings';

export type AdminTargetType =
  | 'user'
  | 'question'
  | 'quiz'
  | 'material'
  | 'wallet'
  | 'membership'
  | 'notification'
  | 'settings';

// Dashboard stats
export interface DashboardStats {
  users: {
    total: number;
    today: number;
    active_7d: number;
  };
  revenue: {
    today: number;
    month: number;
    total: number;
  };
  quizzes: {
    attempts_today: number;
    avg_score: number;
  };
  content: {
    pending_questions: number;
    total_questions: number;
    total_materials: number;
  };
}
