import { z } from 'zod';

// User role enum
const userRoleEnum = z.enum(['guest', 'student', 'member', 'contributor', 'admin']);

// User language enum
const userLanguageEnum = z.enum(['en', 'hi', 'both']);

// Registration schema
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  class: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  language: userLanguageEnum.default('en'),
  career_interests: z.array(z.string()).optional(),
  study_goals: z.string().optional(),
});

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  class: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  language: userLanguageEnum.optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// User search schema (admin)
export const userSearchSchema = z.object({
  query: z.string().optional(),
  role: userRoleEnum.optional(),
  class: z.string().optional(),
  membership_status: z.enum(['active', 'expired', 'none']).optional(),
  is_blocked: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
