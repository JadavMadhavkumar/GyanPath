// Payment transaction types
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type PaymentPurpose = 'membership' | 'material' | 'coins' | 'other';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  amount_paisa: number;
  currency: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  purpose_id?: string | null;
  fee_amount: number; // 2% transaction fee in paisa
  invoice_number?: string | null;
  invoice_url?: string | null;
  failure_reason?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentOrderInput {
  plan_id?: string;
  material_id?: string;
  amount_paisa: number;
  purpose: PaymentPurpose;
  purpose_id?: string;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        email: string;
        contact: string;
        notes: {
          user_id: string;
          plan_id?: string;
          material_id?: string;
        };
        fee: number;
        tax: number;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export interface Invoice {
  invoice_number: string;
  invoice_url: string;
  amount: number;
  fee_amount: number;
  total_amount: number;
  date: string;
  user_name: string;
  user_email: string;
  description: string;
}
