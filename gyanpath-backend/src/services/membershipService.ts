import { getSupabaseAdmin } from '../lib/supabase';
import { getRazorpay } from '../lib/razorpay';
import {
  MembershipPlan,
  UserMembership,
  PaymentTransaction,
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from '../types';
import { config } from '../config';
import { walletService } from './walletService';
import logger from '../utils/logger';
import crypto from 'crypto';

class MembershipService {
  /**
   * Get all active membership plans
   */
  async getPlans() {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      throw error;
    }

    return data as MembershipPlan[];
  }

  /**
   * Get user's current membership
   */
  async getUserMembership(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_memberships')
      .select('*, plan:membership_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      hasActiveMembership: !!data,
      membership: data as UserMembership | null,
    };
  }

  /**
   * Create Razorpay order for membership purchase
   */
  async createOrder(userId: string, input: CreatePaymentOrderInput) {
    const supabase = getSupabaseAdmin();
    const razorpay = getRazorpay();

    // Get plan details if purchasing membership
    let planDetails: MembershipPlan | null = null;
    if (input.purpose === 'membership' && input.purpose_id) {
      const { data: plan, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', input.purpose_id)
        .single();

      if (error) {
        throw error;
      }

      planDetails = plan as MembershipPlan;
    }

    // Calculate amount with transaction fee
    const baseAmount = input.amount_paisa;
    const feeAmount = Math.round(baseAmount * (config.transactionFeePercent / 100));
    const totalAmount = baseAmount + feeAmount;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `membership_${Date.now()}`,
      notes: {
        user_id: userId,
        plan_id: input.purpose_id || '',
        purpose: input.purpose,
      },
    });

    // Create payment transaction record
    const { data: transaction, error: txnError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        razorpay_order_id: order.id,
        amount_paisa: baseAmount,
        fee_amount: feeAmount,
        currency: 'INR',
        status: 'created',
        purpose: input.purpose,
        purpose_id: input.purpose_id,
        metadata: {
          plan_name: planDetails?.name,
          plan_display_name: planDetails?.display_name,
        },
      })
      .select()
      .single();

    if (txnError) {
      throw txnError;
    }

    logger.info(`Payment order created: ${order.id} for user ${userId}`);

    return {
      order_id: order.id,
      amount: totalAmount,
      currency: order.currency,
      key_id: config.razorpay.keyId,
      transaction_id: transaction.id,
      notes: order.notes,
    };
  }

  /**
   * Verify Razorpay payment and activate membership
   */
  async verifyPayment(userId: string, input: VerifyPaymentInput) {
    const supabase = getSupabaseAdmin();
    const razorpay = getRazorpay();

    // Verify signature
    const body = input.razorpay_order_id + '|' + input.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === input.razorpay_signature;

    if (!isSignatureValid) {
      throw new Error('Invalid payment signature');
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(input.razorpay_payment_id);

    if (payment.status !== 'captured') {
      throw new Error(`Payment status: ${payment.status}`);
    }

    // Update payment transaction
    const { data: transaction, error: txnError } = await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: input.razorpay_payment_id,
        razorpay_signature: input.razorpay_signature,
        status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', input.razorpay_order_id)
      .select()
      .single();

    if (txnError) {
      throw txnError;
    }

    // Activate membership if applicable
    if (transaction.purpose === 'membership' && transaction.purpose_id) {
      await this.activateMembership(userId, transaction.purpose_id, transaction.id);
    }

    logger.info(`Payment verified: ${input.razorpay_payment_id} for user ${userId}`);

    return {
      success: true,
      transaction,
      payment,
    };
  }

  /**
   * Activate membership
   */
  private async activateMembership(userId: string, planId: string, transactionId: string) {
    const supabase = getSupabaseAdmin();

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      throw planError;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));

    // Create or update membership
    const { data: membership, error: membershipError } = await supabase
      .from('user_memberships')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_id: transactionId,
        auto_renew: false,
      })
      .select()
      .single();

    if (membershipError) {
      throw membershipError;
    }

    // Update user role to 'member'
    await supabase
      .from('users')
      .update({ role: 'member' })
      .eq('id', userId);

    // Credit membership bonus coins
    const bonusCoins = config.rewards.membershipCoinBonus[plan.name as keyof typeof config.rewards.membershipCoinBonus] || 0;
    if (bonusCoins > 0) {
      await walletService.creditReward(userId, bonusCoins, 'membership_bonus', membership.id);
    }

    logger.info(`Membership activated: ${plan.name} for user ${userId}`);

    return membership as UserMembership;
  }

  /**
   * Handle Razorpay webhook
   */
  async handleWebhook(event: any) {
    const { event: eventType, payload } = event;
    const payment = payload.payment.entity;
    const userId = payment.notes.user_id;

    logger.info(`Razorpay webhook received: ${eventType} for payment ${payment.id}`);

    switch (eventType) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payment, userId);
        break;

      case 'payment.failed':
        await this.handlePaymentFailed(payment, userId);
        break;

      case 'refund.created':
        await this.handleRefund(payment, userId);
        break;

      default:
        logger.warn(`Unhandled webhook event: ${eventType}`);
    }
  }

  private async handlePaymentCaptured(payment: any, userId: string) {
    const supabase = getSupabaseAdmin();

    // Update transaction if not already verified
    await supabase
      .from('payment_transactions')
      .update({
        status: 'captured',
        razorpay_payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', payment.order_id)
      .neq('status', 'captured');

    // Activate membership if applicable
    const { data: transaction } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (transaction && transaction.purpose === 'membership' && transaction.purpose_id) {
      await this.activateMembership(userId, transaction.purpose_id, transaction.id);
    }
  }

  private async handlePaymentFailed(payment: any, userId: string) {
    const supabase = getSupabaseAdmin();

    await supabase
      .from('payment_transactions')
      .update({
        status: 'failed',
        failure_reason: 'Payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', payment.order_id);

    logger.warn(`Payment failed: ${payment.id} for user ${userId}`);
  }

  private async handleRefund(payment: any, userId: string) {
    const supabase = getSupabaseAdmin();

    await supabase
      .from('payment_transactions')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_payment_id', payment.id);

    logger.info(`Refund processed: ${payment.id} for user ${userId}`);
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 20, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      transactions: data as PaymentTransaction[],
      total: count || 0,
    };
  }

  /**
   * Get all transactions (admin)
   */
  async getAllTransactions(params: {
    status?: string;
    purpose?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase.from('payment_transactions').select('*', { count: 'exact' });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.purpose) {
      query = query.eq('purpose', params.purpose);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 20);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + (params.limit || 20) - 1);

    if (error) {
      throw error;
    }

    return {
      transactions: data as PaymentTransaction[],
      total: count || 0,
      page: params.page || 1,
      limit: params.limit || 20,
    };
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(startDate: string, endDate: string) {
    const supabase = getSupabaseAdmin();

    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('amount_paisa, fee_amount, purpose, created_at')
      .eq('status', 'captured')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      throw error;
    }

    const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount_paisa, 0) || 0;
    const totalFees = transactions?.reduce((sum, t) => sum + t.fee_amount, 0) || 0;
    const membershipRevenue = transactions
      ?.filter((t) => t.purpose === 'membership')
      .reduce((sum, t) => sum + t.amount_paisa, 0) || 0;
    const materialRevenue = transactions
      ?.filter((t) => t.purpose === 'material')
      .reduce((sum, t) => sum + t.amount_paisa, 0) || 0;

    // Daily breakdown
    const dailyMap = new Map<string, { revenue: number; transactions: number }>();
    transactions?.forEach((t) => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { revenue: 0, transactions: 0 };
      dailyMap.set(date, {
        revenue: existing.revenue + t.amount_paisa,
        transactions: existing.transactions + 1,
      });
    });

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions,
    }));

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      total_revenue: totalRevenue,
      membership_revenue: membershipRevenue,
      material_revenue: materialRevenue,
      transaction_count: transactions?.length || 0,
      average_order_value: transactions?.length ? totalRevenue / transactions.length : 0,
      total_fees_collected: totalFees,
      net_revenue: totalRevenue - totalFees,
      daily_breakdown: dailyBreakdown,
    };
  }
}

export const membershipService = new MembershipService();
