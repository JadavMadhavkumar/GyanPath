import { z } from 'zod';

// Material type enum
const materialTypeEnum = z.enum(['pdf', 'notes', 'video_bundle', 'question_pack']);
const paymentTypeEnum = z.enum(['coins', 'cash', 'free', 'membership']);

// Create material schema
export const createMaterialSchema = z.object({
  title: z.string().min(3).max(200),
  title_hi: z.string().optional(),
  description: z.string().optional(),
  description_hi: z.string().optional(),
  type: materialTypeEnum,
  subject_id: z.string().uuid().optional(),
  class: z.string().optional(),
  price_coins: z.number().int().min(0).default(0),
  price_cash: z.number().min(0).default(0),
  is_premium_only: z.boolean().default(false),
});

// Purchase material schema
export const purchaseMaterialSchema = z.object({
  material_id: z.string().uuid('Invalid material ID'),
  payment_type: paymentTypeEnum,
});

// Material review schema
export const materialReviewSchema = z.object({
  material_id: z.string().uuid('Invalid material ID'),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type PurchaseMaterialInput = z.infer<typeof purchaseMaterialSchema>;
export type MaterialReviewInput = z.infer<typeof materialReviewSchema>;
