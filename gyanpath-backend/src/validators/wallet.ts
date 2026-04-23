import { z } from 'zod';

// Wallet transaction type enum
const walletTransactionTypeEnum = z.enum([
  'credit_reward',
  'credit_commission',
  'credit_purchase',
  'credit_refund',
  'credit_admin',
  'debit_purchase',
  'debit_transfer',
  'debit_admin',
  'debit_expiry',
]);

const walletCurrencyEnum = z.enum(['coin', 'cash']);

// Wallet operation schema
export const walletOperationSchema = z.object({
  operation: z.enum(['credit', 'debit']),
  type: walletTransactionTypeEnum,
  currency: walletCurrencyEnum,
  amount: z.number().int().positive('Amount must be positive'),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Admin wallet adjust schema
export const adminWalletAdjustSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  operation: z.enum(['credit', 'debit']),
  currency: walletCurrencyEnum,
  amount: z.number().int().positive('Amount must be positive'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

// Coin redemption schema
export const redeemCoinsSchema = z.object({
  amount: z.number().int().min(100, 'Minimum 100 coins required'),
  upi_id: z.string().min(5, 'Invalid UPI ID'),
});

export type WalletOperationInput = z.infer<typeof walletOperationSchema>;
export type AdminWalletAdjustInput = z.infer<typeof adminWalletAdjustSchema>;
export type RedeemCoinsInput = z.infer<typeof redeemCoinsSchema>;
