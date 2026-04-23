import { Router } from 'express';
import { membershipService } from '../services/membershipService';
import { validateBody } from '../middleware/validation';
import { purchaseMembershipSchema, createPaymentOrderSchema, verifyPaymentSchema } from '../validators/membership';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse, createdResponse } from '../utils/response';
import { config } from '../config';

const router = Router();

/**
 * GET /api/v1/membership/plans
 * Get available membership plans
 */
router.get(
  '/plans',
  asyncHandler(async (req, res) => {
    const plans = await membershipService.getPlans();
    return successResponse(res, plans);
  })
);

/**
 * GET /api/v1/membership/my-membership
 * Get user's current membership
 */
router.get(
  '/my-membership',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const membership = await membershipService.getUserMembership(req.userId!);
    return successResponse(res, membership);
  })
);

/**
 * POST /api/v1/membership/order
 * Create payment order for membership
 */
router.post(
  '/order',
  authMiddleware,
  validateBody(createPaymentOrderSchema),
  asyncHandler(async (req, res) => {
    const order = await membershipService.createOrder(req.userId!, req.body);
    return createdResponse(res, order);
  })
);

/**
 * POST /api/v1/membership/verify-payment
 * Verify Razorpay payment
 */
router.post(
  '/verify-payment',
  authMiddleware,
  validateBody(verifyPaymentSchema),
  asyncHandler(async (req, res) => {
    const result = await membershipService.verifyPayment(req.userId!, req.body);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/membership/webhook
 * Razorpay webhook handler
 */
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Handle webhook event
    await membershipService.handleWebhook(req.body);

    return successResponse(res, { success: true });
  })
);

/**
 * GET /api/v1/membership/transactions
 * Get user's transaction history
 */
router.get(
  '/transactions',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query as any;
    const result = await membershipService.getTransactionHistory(req.userId!, limit, offset);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/membership/admin/transactions
 * Get all transactions (admin only)
 */
router.get(
  '/admin/transactions',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await membershipService.getAllTransactions(req.query as any);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/membership/admin/revenue-report
 * Generate revenue report (admin only)
 */
router.get(
  '/admin/revenue-report',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query as any;
    const report = await membershipService.generateRevenueReport(start_date, end_date);
    return successResponse(res, report);
  })
);

export default router;
