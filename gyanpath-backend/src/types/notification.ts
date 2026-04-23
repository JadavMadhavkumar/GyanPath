// Notification types
export type NotificationType =
  | 'quiz_reminder'
  | 'daily_question'
  | 'achievement'
  | 'reward'
  | 'membership_expiry'
  | 'system'
  | 'moderation'
  | 'tip'
  | 'admission_open'
  | 'new_feature'
  | 'battle_invite'
  | 'group_announcement'
  | 'question_approved'
  | 'commission_earned'
  | 'referral_joined'
  | 'scholarship_available';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  data?: Record<string, any>; // deep link data
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
}

export interface BroadcastNotificationInput {
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
  target_user_ids?: string[]; // If empty, broadcast to all
  filters?: {
    role?: string;
    membership_status?: string;
    class?: string;
  };
}

export interface NotificationPreferences {
  user_id: string;
  quiz_reminder: boolean;
  daily_question: boolean;
  achievement: boolean;
  reward: boolean;
  membership_expiry: boolean;
  system: boolean;
  tip: boolean;
  marketing: boolean;
}
