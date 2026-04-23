import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../lib/supabase';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response';
import { User, UserRole } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      userRole?: UserRole;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return unauthorizedResponse(res, 'Invalid or expired token');
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return unauthorizedResponse(res, 'User profile not found');
    }

    // Check if user is blocked
    if (profile.is_blocked) {
      return forbiddenResponse(res, 'Your account has been blocked. Please contact support.');
    }

    // Attach user info to request
    req.user = profile as User;
    req.userId = user.id;
    req.userRole = profile.role as UserRole;

    next();
  } catch (error) {
    return unauthorizedResponse(res, 'Authentication failed');
  }
}

/**
 * Optional auth middleware - attaches user if token is valid, but doesn't require it
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const supabase = getSupabaseClient(token);

      const { data: { user }, error } = await supabase.auth.getUser();

      if (user && !error) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          req.user = profile as User;
          req.userId = user.id;
          req.userRole = profile.role as UserRole;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without user if error
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return forbiddenResponse(res, 'Authentication required');
    }

    if (!roles.includes(req.userRole)) {
      return forbiddenResponse(res, 'You do not have permission to perform this action');
    }

    next();
  };
}

/**
 * Admin authorization middleware
 */
export function requireAdmin() {
  return requireRole('admin');
}

/**
 * Membership check middleware
 */
export function requireMembership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supabase = getSupabaseClient(req.headers.authorization?.split(' ')[1]);

      const { data: membership, error } = await supabase
        .from('user_memberships')
        .select('*, plan:membership_plans(*)')
        .eq('user_id', req.userId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !membership) {
        return forbiddenResponse(res, 'Active membership required');
      }

      // Attach membership to request
      (req as any).membership = membership;
      next();
    } catch (error) {
      return forbiddenResponse(res, 'Membership verification failed');
    }
  };
}
