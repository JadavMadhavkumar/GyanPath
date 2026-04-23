import { getSupabaseAdmin } from '../lib/supabase';
import { RegisterUserInput, UpdateUserProfileInput, User } from '../types';
import logger from '../utils/logger';

class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterUserInput) {
    const supabase = getSupabaseAdmin();

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.full_name,
          phone: input.phone,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: input.email,
          full_name: input.full_name,
          phone: input.phone,
          class: input.class,
          subjects: input.subjects || [],
          language: input.language || 'en',
          role: 'student',
        })
        .select()
        .single();

      if (profileError) {
        // Rollback: delete auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      logger.info(`User registered: ${profile.id}`);

      return {
        user: profile as User,
        message: 'Registration successful',
      };
    } catch (error: any) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user (handled by Supabase Auth client)
   * This is just a placeholder - actual login happens via Supabase SDK
   */
  async login(input: { email: string; password: string }) {
    // Login is handled by Supabase Auth directly from the client
    // This method is for reference only
    throw new Error('Login should be done through Supabase Auth client');
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateUserProfileInput) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('users')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Profile updated for user: ${userId}`);

    return data as User;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const supabase = getSupabaseAdmin();

    // Update password via Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    logger.info(`Password changed for user: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  /**
   * Reset password (admin)
   */
  async resetPassword(userId: string, newPassword: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    logger.info(`Password reset for user: ${userId} by admin`);

    return { message: 'Password reset successfully' };
  }

  /**
   * Logout user (handled by Supabase Auth client)
   */
  async logout(userId: string) {
    // Update last active timestamp
    const supabase = getSupabaseAdmin();

    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);

    return { message: 'Logged out successfully' };
  }

  /**
   * Get user membership status
   */
  async getMembershipStatus(userId: string) {
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

  /**
   * Search users (admin)
   */
  async searchUsers(params: {
    query?: string;
    role?: string;
    class?: string;
    membership_status?: string;
    is_blocked?: boolean;
    page?: number;
    limit?: number;
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (params.query) {
      query = query.or(
        `email.ilike.%${params.query}%,full_name.ilike.%${params.query}%`
      );
    }

    if (params.role) {
      query = query.eq('role', params.role);
    }

    if (params.class) {
      query = query.eq('class', params.class);
    }

    if (params.is_blocked !== undefined) {
      query = query.eq('is_blocked', params.is_blocked);
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 20);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + (params.limit || 20) - 1);

    if (error) {
      throw error;
    }

    return {
      users: data as User[],
      total: count || 0,
      page: params.page || 1,
      limit: params.limit || 20,
    };
  }

  /**
   * Block/unblock user (admin)
   */
  async updateUserStatus(userId: string, isBlocked: boolean) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: isBlocked })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`User ${userId} ${isBlocked ? 'blocked' : 'unblocked'} by admin`);

    return data as User;
  }
}

export const authService = new AuthService();
