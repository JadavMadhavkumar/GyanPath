// Supabase Edge Function: Wallet Operations
// Handles wallet credits, debits, and purchases

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type OperationType = 'credit' | 'debit' | 'purchase_material' | 'add_coins';

interface WalletRequest {
  operation: OperationType;
  user_id?: string;
  amount?: number;
  material_id?: string;
  payment_id?: string;
  description?: string;
}

const TRANSACTION_FEE_PERCENT = 0.02; // 2% fee

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from auth token
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: WalletRequest = await req.json();
    const { operation, amount, material_id, payment_id, description } = body;

    // Use provided user_id or authenticated user
    const targetUserId = body.user_id || userId;
    if (!targetUserId) {
      throw new Error('User not authenticated');
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (walletError || !wallet) {
      throw new Error('Wallet not found');
    }

    let result: any;

    switch (operation) {
      case 'credit': {
        if (!amount || amount <= 0) throw new Error('Invalid amount');
        
        const newBalance = wallet.balance + amount;
        
        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'credit',
          amount,
          source: 'manual_credit',
          description: description || 'Credit to wallet',
          balance_after: newBalance,
        });

        await supabaseClient
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', wallet.id);

        result = { new_balance: newBalance };
        break;
      }

      case 'debit': {
        if (!amount || amount <= 0) throw new Error('Invalid amount');
        if (wallet.balance < amount) throw new Error('Insufficient balance');

        const newBalance = wallet.balance - amount;

        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'debit',
          amount,
          source: 'manual_debit',
          description: description || 'Debit from wallet',
          balance_after: newBalance,
        });

        await supabaseClient
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', wallet.id);

        result = { new_balance: newBalance };
        break;
      }

      case 'purchase_material': {
        if (!material_id) throw new Error('Material ID required');

        // Get material
        const { data: material, error: materialError } = await supabaseClient
          .from('materials')
          .select('*')
          .eq('id', material_id)
          .single();

        if (materialError || !material) throw new Error('Material not found');

        // Check if already purchased
        const { data: existing } = await supabaseClient
          .from('material_purchases')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('material_id', material_id)
          .single();

        if (existing) throw new Error('Material already purchased');

        // Check balance
        if (wallet.balance < material.price_coins) {
          throw new Error('Insufficient balance');
        }

        const newBalance = wallet.balance - material.price_coins;

        // Create transaction
        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'purchase',
          amount: material.price_coins,
          source: 'material_purchase',
          reference_id: material_id,
          description: `Purchased: ${material.title}`,
          balance_after: newBalance,
        });

        // Update wallet
        await supabaseClient
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', wallet.id);

        // Record purchase
        await supabaseClient.from('material_purchases').insert({
          user_id: targetUserId,
          material_id,
          price_paid: material.price_coins,
        });

        result = {
          new_balance: newBalance,
          material: {
            id: material.id,
            title: material.title,
            file_url: material.file_url,
          },
        };
        break;
      }

      case 'add_coins': {
        // Called after successful payment
        if (!amount || amount <= 0) throw new Error('Invalid amount');
        if (!payment_id) throw new Error('Payment ID required');

        // Calculate coins after fee
        const fee = Math.round(amount * TRANSACTION_FEE_PERCENT);
        const coinsToAdd = amount - fee;
        const newBalance = wallet.balance + coinsToAdd;

        // Record transaction
        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'credit',
          amount: coinsToAdd,
          source: 'coin_purchase',
          reference_id: payment_id,
          description: `Purchased ${amount} coins (${fee} fee)`,
          balance_after: newBalance,
        });

        // Update wallet
        await supabaseClient
          .from('wallets')
          .update({ balance: newBalance })
          .eq('id', wallet.id);

        result = {
          coins_purchased: amount,
          fee_deducted: fee,
          coins_credited: coinsToAdd,
          new_balance: newBalance,
        };
        break;
      }

      default:
        throw new Error('Invalid operation');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
