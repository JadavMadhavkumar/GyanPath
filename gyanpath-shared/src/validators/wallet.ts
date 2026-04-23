import { z } from 'zod';

// Wallet operation validator
export const walletOperationSchema = z.object({
  user_id: z.string().uuid(),
  operation: z.enum(['credit', 'debit']),
  type: z.enum([
    'credit_reward',
    'credit_commission',
    'credit_purchase',
    'credit_refund',
    'credit_admin',
    'debit_purchase',
    'debit_transfer',
    'debit_admin',
    'debit_expiry',
  ]),
  currency: z.enum(['coin', 'cash']),
  amount: z.number().int().positive('Amount must be positive'),
  reference_type: z.string().max(50).optional(),
  reference_id: z.string().uuid().optional(),
  description: z.string().max(255).optional(),
});

// Purchase material validator
export const purchaseMaterialSchema = z.object({
  material_id: z.string().uuid(),
  payment_type: z.enum(['coins', 'cash']),
});

// Create payment order validator
export const createOrderSchema = z.object({
  purpose: z.enum(['membership', 'material', 'coins']),
  purpose_id: z.string().uuid(),
});

// Verify payment validator
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type WalletOperationInput = z.infer<typeof walletOperationSchema>;
export type PurchaseMaterialInput = z.infer<typeof purchaseMaterialSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
