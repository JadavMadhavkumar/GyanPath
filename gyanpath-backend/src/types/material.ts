// Educational Material types
export type MaterialType = 'pdf' | 'notes' | 'video_bundle' | 'question_pack';

export type PaymentType = 'coins' | 'cash' | 'free' | 'membership';

export type PurchaseStatus = 'pending' | 'completed' | 'refunded';

export interface Material {
  id: string;
  title: string;
  title_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  type: MaterialType;
  subject_id?: string | null;
  class?: string | null;
  thumbnail_url?: string | null;
  file_url?: string | null;
  file_size_bytes?: number | null;
  price_coins: number;
  price_cash: number;
  is_premium_only: boolean;
  is_active: boolean;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  subject?: {
    id: string;
    name: string;
    display_name: string;
  };
}

export interface CreateMaterialInput {
  title: string;
  title_hi?: string;
  description?: string;
  description_hi?: string;
  type: MaterialType;
  subject_id?: string;
  class?: string;
  thumbnail_url?: string;
  price_coins?: number;
  price_cash?: number;
  is_premium_only?: boolean;
}

export interface MaterialPurchase {
  id: string;
  user_id: string;
  material_id: string;
  payment_type: PaymentType;
  amount_paid?: number | null;
  wallet_txn_id?: string | null;
  status: PurchaseStatus;
  downloaded_at?: string | null;
  created_at: string;
  material?: Material;
}

export interface PurchaseMaterialInput {
  material_id: string;
  payment_type: PaymentType;
}

export interface MaterialReview {
  id: string;
  material_id: string;
  user_id: string;
  rating: number; // 1-5
  review?: string | null;
  created_at: string;
}
