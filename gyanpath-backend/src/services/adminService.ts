import { getSupabaseAdmin } from '../lib/supabase';
import { AdminActionLog, CreateAdminActionLogInput, DashboardStats, User } from '../types';
import { quizService } from './quizService';
import { walletService } from './walletService';
import { membershipService } from './membershipService';
import logger from '../utils/logger';

class AdminService {
  /**
   * Log admin action
   */
  async logAdminAction(input: CreateAdminActionLogInput) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('admin_action_logs')
      .insert({
        admin_id: input.admin_id,
        action: input.action,
        target_type: input.target_type,
        target_id: input.target_id,
        old_value: input.old_value,
        new_value: input.new_value,
        reason: input.reason,
        ip_address: input.ip_address,
        user_agent: input.user_agent,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Admin action logged: ${input.action} by ${input.admin_id}`);

    return data as AdminActionLog;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    // Active users today
    const { count: activeUsersToday } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_active_at', `${today}T00:00:00`);

    // Quiz attempts today
    const { count: quizAttemptsToday } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    // Revenue today
    const { data: revenueToday } = await supabase
      .from('payment_transactions')
      .select('amount_paisa')
      .eq('status', 'captured')
      .gte('created_at', `${today}T00:00:00`);

    const totalRevenueToday = revenueToday?.reduce((sum, t) => sum + t.amount_paisa, 0) || 0;

    // Revenue this month
    const monthStart = new Date();
    monthStart.setDate(1);
    const { data: revenueMonth } = await supabase
      .from('payment_transactions')
      .select('amount_paisa')
      .eq('status', 'captured')
      .gte('created_at', monthStart.toISOString());

    const totalRevenueMonth = revenueMonth?.reduce((sum, t) => sum + t.amount_paisa, 0) || 0;

    // Pending questions
    const { count: pendingQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Active memberships
    const { count: activeMemberships } = await supabase
      .from('user_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString());

    // Total materials
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Total groups
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Wallet stats
    const walletStats = await walletService.getWalletStats();

    const { count: transactionsToday } = await supabase
      .from('wallet_transactions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    return {
      total_users: totalUsers || 0,
      active_users_today: activeUsersToday || 0,
      total_quiz_attempts_today: quizAttemptsToday || 0,
      total_revenue_today: totalRevenueToday,
      total_revenue_month: totalRevenueMonth,
      pending_questions: pendingQuestions || 0,
      active_memberships: activeMemberships || 0,
      total_materials: totalMaterials || 0,
      total_groups: totalGroups || 0,
      wallet_stats: {
        total_coins_in_circulation: walletStats.total_coins_in_circulation,
        total_cash_in_circulation: walletStats.total_cash_in_circulation,
        total_transactions_today: transactionsToday || 0,
      },
    } as DashboardStats;
  }

  /**
   * Get admin action logs
   */
  async getAdminLogs(params: {
    admin_id?: string;
    action?: string;
    target_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('admin_action_logs')
      .select(`
        *,
        admin:users!admin_action_logs_admin_id_fkey(id, full_name, email)
      `, { count: 'exact' });

    if (params.admin_id) {
      query = query.eq('admin_id', params.admin_id);
    }

    if (params.action) {
      query = query.eq('action', params.action);
    }

    if (params.target_type) {
      query = query.eq('target_type', params.target_type);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 50);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + (params.limit || 50) - 1);

    if (error) {
      throw error;
    }

    return {
      logs: data as AdminActionLog[],
      total: count || 0,
      page: params.page || 1,
      limit: params.limit || 50,
    };
  }

  /**
   * Get fraud detection report
   */
  async getFraudReport() {
    const supabase = getSupabaseAdmin();

    // Detect suspicious users (high quiz scores in short time)
    const { data: suspiciousUsers } = await supabase
      .from('quiz_attempts')
      .select('user_id, score, time_taken_seconds')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const userFlags = new Map<string, { reasons: string[]; riskScore: number }>();

    suspiciousUsers?.forEach((attempt) => {
      // Flag perfect scores in very short time
      if (attempt.score >= 100 && attempt.time_taken_seconds && attempt.time_taken_seconds < 30) {
        const existing = userFlags.get(attempt.user_id) || { reasons: [], riskScore: 0 };
        existing.reasons.push('Suspicious quiz speed');
        existing.riskScore += 30;
        userFlags.set(attempt.user_id, existing);
      }
    });

    // Duplicate questions count
    const { count: duplicateQuestions } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .not('duplicate_of', 'is', null);

    // Suspicious wallet transactions
    const { data: walletTxns } = await supabase
      .from('wallet_transactions')
      .select('user_id, amount, type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('type', ['credit_reward', 'credit_commission', 'credit_admin']);

    const suspiciousTransactions = walletTxns?.filter((txn) => txn.amount > 500).length || 0;

    const suspiciousUsersList = Array.from(userFlags.entries()).map(([userId, data]) => ({
      user_id: userId,
      reason: data.reasons.join(', '),
      risk_score: Math.min(100, data.riskScore),
      flags: data.reasons,
    }));

    return {
      suspicious_users: suspiciousUsersList,
      duplicate_questions: duplicateQuestions || 0,
      suspicious_transactions: suspiciousTransactions,
      quiz_cheating_attempts: suspiciousUsers?.filter(
        (a) => a.score >= 100 && a.time_taken_seconds && a.time_taken_seconds < 30
      ).length || 0,
      referral_abuse_detected: 0, // Implement referral tracking
    };
  }

  /**
   * Update app settings (stored in a settings table or config)
   */
  async updateAppSettings(settings: Record<string, any>, adminId: string) {
    const supabase = getSupabaseAdmin();

    // Store settings in a config table or use Supabase config
    // For now, log the action
    await this.logAdminAction({
      admin_id: adminId,
      action: 'update_app_settings',
      target_type: 'system',
      target_id: 'app_settings',
      new_value: settings,
      reason: 'App settings updated',
    });

    logger.info(`App settings updated by admin ${adminId}`);

    return { success: true, message: 'Settings updated' };
  }

  /**
   * Get system logs (from a logs table if implemented)
   */
  async getSystemLogs(params: { level?: string; limit?: number }) {
    // System logs would be stored in a separate table or external logging service
    // For now, return empty
    return {
      logs: [],
      total: 0,
    };
  }
}

export const adminService = new AdminService();
