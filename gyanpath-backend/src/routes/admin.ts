import { Router } from 'express';
import { adminService } from '../services/adminService';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/admin/dashboard
 * Get dashboard statistics
 */
router.get(
  '/dashboard',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats);
  })
);

/**
 * GET /api/v1/admin/logs
 * Get admin action logs
 */
router.get(
  '/logs',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await adminService.getAdminLogs(req.query as any);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/admin/fraud-report
 * Get fraud detection report
 */
router.get(
  '/fraud-report',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const report = await adminService.getFraudReport();
    return successResponse(res, report);
  })
);

/**
 * PUT /api/v1/admin/settings
 * Update app settings
 */
router.put(
  '/settings',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await adminService.updateAppSettings(req.body, req.userId!);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/admin/system-logs
 * Get system logs
 */
router.get(
  '/system-logs',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await adminService.getSystemLogs(req.query as any);
    return successResponse(res, result);
  })
);

export default router;
