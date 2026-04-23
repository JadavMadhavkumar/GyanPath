import { Router } from 'express';
import { walletService } from '../services/walletService';
import { validateBody } from '../middleware/validation';
import { walletOperationSchema, adminWalletAdjustSchema, redeemCoinsSchema } from '../validators/wallet';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/wallet/balance
 * Get wallet balance
 */
router.get(
  '/balance',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const balance = await walletService.getWalletBalance(req.userId!);
    return successResponse(res, balance);
  })
);

/**
 * GET /api/v1/wallet/transactions
 * Get transaction history
 */
router.get(
  '/transactions',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query as any;
    const result = await walletService.getTransactionHistory(req.userId!, limit, offset);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/wallet/operation
 * Perform wallet operation (internal use via edge functions)
 */
router.post(
  '/operation',
  authMiddleware,
  validateBody(walletOperationSchema),
  asyncHandler(async (req, res) => {
    const result = await walletService.performOperation({
      ...req.body,
      user_id: req.userId!,
    });
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/wallet/redeem
 * Redeem coins for cash (UPI withdrawal)
 */
router.post(
  '/redeem',
  authMiddleware,
  validateBody(redeemCoinsSchema),
  asyncHandler(async (req, res) => {
    // Implementation for coin redemption
    // This would integrate with UPI payment system
    const { amount, upi_id } = req.body;

    // Debit coins from wallet
    await walletService.debitPurchase(req.userId!, amount, 'redemption', 'upi_withdrawal');

    // Create withdrawal request (would be stored in a withdrawal_requests table)
    // For now, return success
    return successResponse(res, {
      success: true,
      message: 'Withdrawal request submitted',
      amount,
      upi_id,
    });
  })
);

/**
 * POST /api/v1/wallet/admin/adjust
 * Admin adjust wallet balance
 */
router.post(
  '/admin/adjust',
  authMiddleware,
  requireRole('admin'),
  validateBody(adminWalletAdjustSchema),
  asyncHandler(async (req, res) => {
    const result = await walletService.adminAdjust(
      req.body.user_id,
      req.body.amount,
      req.body.currency,
      req.body.reason,
      req.userId!
    );
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/wallet/admin/stats
 * Get wallet statistics (admin only)
 */
router.get(
  '/admin/stats',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const stats = await walletService.getWalletStats();
    return successResponse(res, stats);
  })
);

export default router;
