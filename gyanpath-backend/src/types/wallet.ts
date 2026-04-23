// Wallet types
export type WalletTransactionType =
  | 'credit_reward'
  | 'credit_commission'
  | 'credit_purchase'
  | 'credit_refund'
  | 'credit_admin'
  | 'debit_purchase'
  | 'debit_transfer'
  | 'debit_admin'
  | 'debit_expiry';

export type WalletCurrency = 'coin' | 'cash';

export interface Wallet {
  id: string;
  user_id: string;
  coin_balance: number;
  cash_balance: number;
  total_earned_coins: number;
  total_spent_coins: number;
  daily_limit: number;
  monthly_limit: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: WalletTransactionType;
  currency: WalletCurrency;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type?: string | null; // 'quiz', 'material', 'membership', 'question', etc.
  reference_id?: string | null;
  description?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface WalletOperationInput {
  user_id: string;
  operation: 'credit' | 'debit';
  type: WalletTransactionType;
  currency: WalletCurrency;
  amount: number;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WalletBalanceResponse {
  wallet: Wallet;
  recent_transactions: WalletTransaction[];
}
