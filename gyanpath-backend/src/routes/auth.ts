import { Router } from 'express';
import { authService } from '../services/authService';
import { validateBody, validateQuery } from '../middleware/validation';
import { registerUserSchema, updateProfileSchema, userSearchSchema, changePasswordSchema } from '../validators/user';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse, createdResponse } from '../utils/response';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody(registerUserSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return createdResponse(res, result);
  })
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await authService.logout(req.userId!);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.userId!);
    return successResponse(res, profile);
  })
);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authMiddleware,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await authService.updateProfile(req.userId!, req.body);
    return successResponse(res, profile);
  })
);

/**
 * POST /api/v1/auth/change-password
 * Change password
 */
router.post(
  '/change-password',
  authMiddleware,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.changePassword(
      req.userId!,
      req.body.current_password,
      req.body.new_password
    );
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/auth/membership
 * Get user membership status
 */
router.get(
  '/membership',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const membership = await authService.getMembershipStatus(req.userId!);
    return successResponse(res, membership);
  })
);

/**
 * GET /api/v1/auth/users
 * Search users (admin only)
 */
router.get(
  '/users',
  authMiddleware,
  requireRole('admin'),
  validateQuery(userSearchSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.searchUsers(req.query as any);
    return successResponse(res, result);
  })
);

/**
 * PUT /api/v1/auth/users/:userId/status
 * Block/unblock user (admin only)
 */
router.put(
  '/users/:userId/status',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { is_blocked } = req.body;
    const user = await authService.updateUserStatus(req.params.userId, is_blocked);
    return successResponse(res, user);
  })
);

/**
 * POST /api/v1/auth/users/:userId/reset-password
 * Reset user password (admin only)
 */
router.post(
  '/users/:userId/reset-password',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { new_password } = req.body;
    const result = await authService.resetPassword(req.params.userId, new_password);
    return successResponse(res, result);
  })
);

export default router;
