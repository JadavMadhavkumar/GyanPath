import type { UserRole } from '../types';

// User role definitions with permissions
export const ROLES: Record<UserRole, {
  label: string;
  description: string;
  permissions: string[];
}> = {
  guest: {
    label: 'Guest',
    description: 'Unauthenticated visitor',
    permissions: ['view_public'],
  },
  student: {
    label: 'Student',
    description: 'Standard registered user',
    permissions: [
      'view_public',
      'take_quiz',
      'view_wallet',
      'view_materials',
      'purchase_materials',
      'submit_questions',
      'view_notifications',
      'update_profile',
    ],
  },
  member: {
    label: 'Member',
    description: 'Paid membership user',
    permissions: [
      'view_public',
      'take_quiz',
      'take_unlimited_quiz',
      'view_wallet',
      'view_materials',
      'purchase_materials',
      'submit_questions',
      'view_notifications',
      'update_profile',
      'view_ai_insights',
      'view_premium_content',
    ],
  },
  contributor: {
    label: 'Contributor',
    description: 'Content contributor',
    permissions: [
      'view_public',
      'take_quiz',
      'view_wallet',
      'view_materials',
      'purchase_materials',
      'submit_questions',
      'submit_materials',
      'view_notifications',
      'update_profile',
      'earn_commission',
    ],
  },
  admin: {
    label: 'Admin',
    description: 'Platform administrator',
    permissions: [
      'view_public',
      'take_quiz',
      'view_wallet',
      'view_materials',
      'manage_users',
      'manage_content',
      'manage_wallets',
      'manage_payments',
      'manage_settings',
      'view_analytics',
      'view_admin_panel',
    ],
  },
} as const;

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

// Check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

// Check if user has membership benefits
export function hasMembershipBenefits(role: UserRole): boolean {
  return role === 'member' || role === 'admin';
}
