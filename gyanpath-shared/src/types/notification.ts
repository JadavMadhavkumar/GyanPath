// Notification types
export type NotificationType =
  | 'quiz_reminder'
  | 'daily_question'
  | 'achievement'
  | 'reward'
  | 'membership_expiry'
  | 'system'
  | 'moderation'
  | 'tip';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface PushNotificationPayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}
