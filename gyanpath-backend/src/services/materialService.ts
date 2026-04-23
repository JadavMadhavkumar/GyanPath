import { getSupabaseAdmin } from '../lib/supabase';
import { Material, MaterialPurchase, CreateMaterialInput, PurchaseMaterialInput } from '../types';
import { walletService } from './walletService';
import logger from '../utils/logger';

class MaterialService {
  /**
   * List all active materials
   */
  async listMaterials(params: {
    subject_id?: string;
    type?: string;
    class?: string;
    is_premium_only?: boolean;
    page?: number;
    limit?: number;
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('materials')
      .select(`
        *,
        subject:subjects(id, name, display_name)
      `, { count: 'exact' })
      .eq('is_active', true);

    if (params.subject_id) {
      query = query.eq('subject_id', params.subject_id);
    }

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.class) {
      query = query.eq('class', params.class);
    }

    if (params.is_premium_only) {
      query = query.eq('is_premium_only', true);
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 20);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + (params.limit || 20) - 1);

    if (error) {
      throw error;
    }

    return {
      materials: data as Material[],
      total: count || 0,
      page: params.page || 1,
      limit: params.limit || 20,
    };
  }

  /**
   * Get material details
   */
  async getMaterial(materialId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        subject:subjects(id, name, display_name)
      `)
      .eq('id', materialId)
      .single();

    if (error) {
      throw error;
    }

    return data as Material;
  }

  /**
   * Create material (admin or contributor)
   */
  async createMaterial(input: CreateMaterialInput, createdBy: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('materials')
      .insert({
        ...input,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Material created: ${data.id} by ${createdBy}`);

    return data as Material;
  }

  /**
   * Check if user has purchased a material
   */
  async checkPurchaseStatus(userId: string, materialId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('material_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('material_id', materialId)
      .eq('status', 'completed')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return {
      hasPurchased: !!data,
      purchase: data as MaterialPurchase | null,
    };
  }

  /**
   * Purchase material with coins or cash
   */
  async purchaseMaterial(userId: string, input: PurchaseMaterialInput) {
    const supabase = getSupabaseAdmin();

    // Get material details
    const material = await this.getMaterial(input.material_id);

    if (!material.is_active) {
      throw new Error('Material is not available');
    }

    // Check if already purchased
    const { hasPurchased } = await this.checkPurchaseStatus(userId, input.material_id);
    if (hasPurchased) {
      throw new Error('Material already purchased');
    }

    // Determine price
    const priceCoins = material.price_coins;
    const priceCash = material.price_cash;

    // Check membership discount
    const { membership } = await this.getUserMembership(userId);
    let discount = 0;
    if (membership?.plan?.benefits?.material_discount) {
      discount = membership.plan.benefits.material_discount;
    }

    let amountToCharge = 0;
    let currency: 'coin' | 'cash' = 'coin';

    if (input.payment_type === 'coins') {
      amountToCharge = Math.round(priceCoins * (1 - discount));
      currency = 'coin';
    } else if (input.payment_type === 'cash') {
      amountToCharge = Math.round(priceCash * (1 - discount) * 100); // Convert to paisa
      currency = 'cash';
    } else if (input.payment_type === 'free') {
      amountToCharge = 0;
    } else if (input.payment_type === 'membership' && material.is_premium_only) {
      if (!membership) {
        throw new Error('Active membership required');
      }
      amountToCharge = 0; // Free with membership
    }

    // Debit wallet if needed
    let walletTxnId: string | null = null;
    if (amountToCharge > 0) {
      const walletResult = await walletService.debitPurchase(
        userId,
        amountToCharge,
        'material',
        input.material_id
      );
      walletTxnId = walletResult.transaction.wallet_id;
    }

    // Create purchase record
    const { data, error } = await supabase
      .from('material_purchases')
      .insert({
        user_id: userId,
        material_id: input.material_id,
        payment_type: input.payment_type,
        amount_paid: amountToCharge,
        wallet_txn_id: walletTxnId,
        status: 'completed',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Increment download count
    await supabase
      .from('materials')
      .update({ download_count: material.download_count + 1 })
      .eq('id', input.material_id);

    logger.info(`Material purchased: ${input.material_id} by user ${userId}`);

    return {
      success: true,
      purchase: data as MaterialPurchase,
      download_url: material.file_url,
      new_coin_balance: currency === 'coin'
        ? (await walletService.getWalletBalance(userId)).coin_balance
        : undefined,
    };
  }

  /**
   * Get user's purchased materials
   */
  async getUserPurchases(userId: string, limit: number = 20, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from('material_purchases')
      .select(`
        *,
        material:materials(*, subject:subjects(id, name, display_name))
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      purchases: data,
      total: count || 0,
    };
  }

  /**
   * Get material download URL (for purchased materials)
   */
  async getDownloadUrl(materialId: string, userId: string) {
    const supabase = getSupabaseAdmin();

    // Verify purchase
    const { hasPurchased } = await this.checkPurchaseStatus(userId, materialId);
    if (!hasPurchased) {
      throw new Error('Material not purchased');
    }

    // Get material
    const material = await this.getMaterial(materialId);

    if (!material.file_url) {
      throw new Error('File not available');
    }

    // Generate signed URL (if using Supabase Storage)
    // For now, return the file_url directly
    return {
      download_url: material.file_url,
      expires_in: 3600, // 1 hour
    };
  }

  /**
   * Get user's membership (helper method)
   */
  private async getUserMembership(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_memberships')
      .select('*, plan:membership_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      hasActiveMembership: !!data,
      membership: data || null,
    };
  }
}

export const materialService = new MaterialService();
