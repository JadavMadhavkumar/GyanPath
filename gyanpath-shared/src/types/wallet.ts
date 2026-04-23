// Wallet types
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

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: WalletTransactionType;
  currency: WalletCurrency;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Payment types
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type PaymentPurpose = 'membership' | 'material' | 'coins' | 'other';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount_paisa: number;
  currency: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  purpose_id: string | null;
  fee_amount: number;
  invoice_number: string | null;
  invoice_url: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
