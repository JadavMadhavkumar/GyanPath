import { z } from 'zod';

// Purchase membership schema
export const purchaseMembershipSchema = z.object({
  plan_id: z.string().uuid('Invalid plan ID'),
  auto_renew: z.boolean().default(false),
});

// Create payment order schema
export const createPaymentOrderSchema = z.object({
  plan_id: z.string().uuid().optional(),
  material_id: z.string().uuid().optional(),
  amount_paisa: z.number().int().positive('Amount must be positive'),
  purpose: z.enum(['membership', 'material', 'coins', 'other']),
  purpose_id: z.string().uuid().optional(),
});

// Verify payment schema
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});

// Refund schema
export const refundSchema = z.object({
  transaction_id: z.string().uuid('Invalid transaction ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  amount_paisa: z.number().int().positive().optional(),
});

export type PurchaseMembershipInput = z.infer<typeof purchaseMembershipSchema>;
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
