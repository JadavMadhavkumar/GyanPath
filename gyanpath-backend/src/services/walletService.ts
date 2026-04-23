import { getSupabaseAdmin } from '../lib/supabase';
import { Wallet, WalletTransaction, WalletOperationInput } from '../types';
import { config } from '../config';
import logger from '../utils/logger';

class WalletService {
  /**
   * Get wallet balance for a user
   */
  async getWalletBalance(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data as Wallet;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      transactions: data as WalletTransaction[],
      total: count || 0,
    };
  }

  /**
   * Perform wallet operation (credit/debit) with double-entry ledger
   */
  async performOperation(input: WalletOperationInput) {
    const supabase = getSupabaseAdmin();

    // Start transaction
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', input.user_id)
      .single();

    if (walletError) {
      throw walletError;
    }

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.is_locked) {
      throw new Error('Wallet is locked');
    }

    // Check limits for credits
    if (input.operation === 'credit' && input.currency === 'coin') {
      await this.checkDailyLimit(wallet.id, input.amount);
    }

    // Check balance for debits
    if (input.operation === 'debit') {
      const currentBalance =
        input.currency === 'coin' ? wallet.coin_balance : wallet.cash_balance;

      if (currentBalance < input.amount) {
        throw new Error('Insufficient balance');
      }
    }

    // Calculate new balance
    const balanceBefore =
      input.currency === 'coin' ? wallet.coin_balance : wallet.cash_balance;
    const balanceAfter =
      input.operation === 'credit'
        ? balanceBefore + input.amount
        : balanceBefore - input.amount;

    // Begin transaction
    const { error: transactionError } = await supabase.rpc('perform_wallet_transaction', {
      p_wallet_id: wallet.id,
      p_user_id: input.user_id,
      p_type: input.type,
      p_currency: input.currency,
      p_amount: input.operation === 'credit' ? input.amount : -input.amount,
      p_balance_before: balanceBefore,
      p_balance_after: balanceAfter,
      p_reference_type: input.reference_type || null,
      p_reference_id: input.reference_id || null,
      p_description: input.description || null,
      p_metadata: input.metadata || {},
      p_new_coin_balance: input.currency === 'coin' ? balanceAfter : wallet.coin_balance,
      p_new_cash_balance: input.currency === 'cash' ? balanceAfter : wallet.cash_balance,
      p_add_to_earned: input.operation === 'credit' && input.currency === 'coin' ? input.amount : 0,
      p_add_to_spent: input.operation === 'debit' && input.currency === 'coin' ? input.amount : 0,
    });

    if (transactionError) {
      logger.error('Wallet transaction failed:', transactionError);
      throw transactionError;
    }

    logger.info(
      `Wallet ${input.operation}: ${input.currency} ${input.amount} for user ${input.user_id}`
    );

    return {
      success: true,
      new_balance: balanceAfter,
      transaction: {
        wallet_id: wallet.id,
        user_id: input.user_id,
        type: input.type,
        currency: input.currency,
        amount: input.operation === 'credit' ? input.amount : -input.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      },
    };
  }

  /**
   * Credit reward coins (e.g., after quiz completion)
   */
  async creditReward(userId: string, amount: number, referenceType: string, referenceId: string) {
    return this.performOperation({
      user_id: userId,
      operation: 'credit',
      type: 'credit_reward',
      currency: 'coin',
      amount,
      reference_type: referenceType,
      reference_id: referenceId,
      description: `Reward for ${referenceType}`,
    });
  }

  /**
   * Debit for purchase
   */
  async debitPurchase(userId: string, amount: number, referenceType: string, referenceId: string) {
    return this.performOperation({
      user_id: userId,
      operation: 'debit',
      type: 'debit_purchase',
      currency: 'coin',
      amount,
      reference_type: referenceType,
      reference_id: referenceId,
      description: `Purchase of ${referenceType}`,
    });
  }

  /**
   * Check daily coin limit
   */
  private async checkDailyLimit(walletId: string, amount: number) {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', walletId)
      .eq('currency', 'coin')
      .gte('created_at', `${today}T00:00:00`)
      .in('type', ['credit_reward', 'credit_commission', 'credit_admin']);

    if (error) {
      throw error;
    }

    const todayEarnings = data?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

    if (todayEarnings + amount > config.rewards.dailyCoinLimit) {
      throw new Error('Daily coin limit exceeded');
    }

    return true;
  }

  /**
   * Admin adjust wallet (manual credit/debit)
   */
  async adminAdjust(
    userId: string,
    amount: number,
    currency: 'coin' | 'cash',
    reason: string,
    adminId: string
  ) {
    const operation = amount > 0 ? 'credit' : 'debit';
    const type = operation === 'credit' ? 'credit_admin' : 'debit_admin';

    return this.performOperation({
      user_id: userId,
      operation,
      type,
      currency,
      amount: Math.abs(amount),
      reference_type: 'admin_adjustment',
      reference_id: adminId,
      description: `Admin adjustment: ${reason}`,
      metadata: {
        admin_id: adminId,
        reason,
      },
    });
  }

  /**
   * Get wallet stats for admin
   */
  async getWalletStats() {
    const supabase = getSupabaseAdmin();

    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('coin_balance, cash_balance, total_earned_coins, total_spent_coins');

    if (error) {
      throw error;
    }

    const totalCoins = wallets?.reduce((sum, w) => sum + w.coin_balance, 0) || 0;
    const totalCash = wallets?.reduce((sum, w) => sum + Number(w.cash_balance), 0) || 0;
    const totalEarned = wallets?.reduce((sum, w) => sum + w.total_earned_coins, 0) || 0;
    const totalSpent = wallets?.reduce((sum, w) => sum + w.total_spent_coins, 0) || 0;

    return {
      total_coins_in_circulation: totalCoins,
      total_cash_in_circulation: totalCash,
      total_earned_all_time: totalEarned,
      total_spent_all_time: totalSpent,
    };
  }
}

export const walletService = new WalletService();
