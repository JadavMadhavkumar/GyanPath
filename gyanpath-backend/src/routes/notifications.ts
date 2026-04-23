import { Router } from 'express';
import { notificationService } from '../services/notificationService';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query as any;
    const result = await notificationService.getUserNotifications(req.userId!, limit, offset);
    return successResponse(res, result);
  })
);

/**
 * PUT /api/v1/notifications/:notificationId/read
 * Mark notification as read
 */
router.put(
  '/:notificationId/read',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.userId!
    );
    return successResponse(res, notification);
  })
);

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.put(
  '/read-all',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.userId!);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/notifications/broadcast
 * Broadcast notification (admin only)
 */
router.post(
  '/broadcast',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await notificationService.broadcastNotification(req.body);
    return successResponse(res, result);
  })
);

export default router;
