import { getSupabaseAdmin } from '../lib/supabase';
import { Notification, NotificationType, CreateNotificationInput, BroadcastNotificationInput } from '../types';
import logger from '../utils/logger';

class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification(input: CreateNotificationInput) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Send push notification via Expo
    // await this.sendPushNotification(input.user_id, input.title, input.body);

    return data as Notification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      notifications: data as Notification[],
      total: count || 0,
      unread_count: data?.filter((n) => !n.is_read).length || 0,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    return { success: true };
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcastNotification(input: BroadcastNotificationInput) {
    const supabase = getSupabaseAdmin();

    let targetUserIds: string[] = [];

    if (input.target_user_ids && input.target_user_ids.length > 0) {
      targetUserIds = input.target_user_ids;
    } else {
      // Get all users or filter by criteria
      let query = supabase.from('users').select('id');

      if (input.filters?.role) {
        query = query.eq('role', input.filters.role);
      }

      const { data: users, error } = await query;

      if (error) {
        throw error;
      }

      targetUserIds = users?.map((u) => u.id) || [];
    }

    // Create notifications in batches
    const batchSize = 100;
    const createdNotifications: Notification[] = [];

    for (let i = 0; i < targetUserIds.length; i += batchSize) {
      const batch = targetUserIds.slice(i, i + batchSize);

      const notifications = batch.map((userId) => ({
        user_id: userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data || {},
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        throw error;
      }

      createdNotifications.push(...(data as Notification[]));
    }

    logger.info(`Broadcast notification sent to ${targetUserIds.length} users`);

    return {
      success: true,
      sent_count: targetUserIds.length,
      notifications: createdNotifications,
    };
  }

  /**
   * Send quiz reminder
   */
  async sendQuizReminder(userId: string) {
    return this.createNotification({
      user_id: userId,
      type: 'quiz_reminder',
      title: 'Time for a Quiz! 📝',
      body: 'Test your knowledge and earn coins. Take a quiz now!',
    });
  }

  /**
   * Send membership expiry warning
   */
  async sendMembershipExpiryWarning(userId: string, daysUntilExpiry: number) {
    return this.createNotification({
      user_id: userId,
      type: 'membership_expiry',
      title: 'Membership Expiring Soon ⏰',
      body: `Your membership will expire in ${daysUntilExpiry} days. Renew now to continue enjoying premium benefits!`,
      data: { days_until_expiry: daysUntilExpiry },
    });
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(userId: string, achievement: string) {
    return this.createNotification({
      user_id: userId,
      type: 'achievement',
      title: 'Achievement Unlocked! 🏆',
      body: `Congratulations! You've earned: ${achievement}`,
    });
  }

  /**
   * Send commission earned notification
   */
  async sendCommissionNotification(userId: string, amount: number) {
    return this.createNotification({
      user_id: userId,
      type: 'commission_earned',
      title: 'Commission Earned 💰',
      body: `You earned ${amount} coins from your contribution!`,
      data: { amount },
    });
  }

  /**
   * Send question approved notification
   */
  async sendQuestionApprovedNotification(userId: string, questionId: string) {
    return this.createNotification({
      user_id: userId,
      type: 'question_approved',
      title: 'Question Approved ✅',
      body: 'Your question has been approved and is now live!',
      data: { question_id: questionId },
    });
  }

  /**
   * Send referral joined notification
   */
  async sendReferralJoinedNotification(userId: string, referredUserName: string) {
    return this.createNotification({
      user_id: userId,
      type: 'referral_joined',
      title: 'Friend Joined! 🎉',
      body: `${referredUserName} joined Gyan Path using your referral. You earned bonus coins!`,
    });
  }
}

export const notificationService = new NotificationService();
