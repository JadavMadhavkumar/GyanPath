import { Router } from 'express';
import { materialService } from '../services/materialService';
import { validateBody, validateParams } from '../middleware/validation';
import { createMaterialSchema, purchaseMaterialSchema } from '../validators/material';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse, createdResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/materials
 * List all materials
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await materialService.listMaterials(req.query as any);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/materials/:materialId
 * Get material details
 */
router.get(
  '/:materialId',
  asyncHandler(async (req, res) => {
    const material = await materialService.getMaterial(req.params.materialId);
    return successResponse(res, material);
  })
);

/**
 * POST /api/v1/materials
 * Create material (admin only)
 */
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validateBody(createMaterialSchema),
  asyncHandler(async (req, res) => {
    const material = await materialService.createMaterial(req.body, req.userId!);
    return createdResponse(res, material);
  })
);

/**
 * GET /api/v1/materials/:materialId/purchase-status
 * Check purchase status
 */
router.get(
  '/:materialId/purchase-status',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const status = await materialService.checkPurchaseStatus(req.userId!, req.params.materialId);
    return successResponse(res, status);
  })
);

/**
 * POST /api/v1/materials/:materialId/purchase
 * Purchase material
 */
router.post(
  '/:materialId/purchase',
  authMiddleware,
  validateBody(purchaseMaterialSchema),
  asyncHandler(async (req, res) => {
    const result = await materialService.purchaseMaterial(req.userId!, {
      material_id: req.params.materialId,
      payment_type: req.body.payment_type,
    });
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/materials/my-purchases
 * Get user's purchased materials
 */
router.get(
  '/my-purchases',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query as any;
    const result = await materialService.getUserPurchases(req.userId!, limit, offset);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/materials/:materialId/download
 * Get download URL for purchased material
 */
router.get(
  '/:materialId/download',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await materialService.getDownloadUrl(req.params.materialId, req.userId!);
    return successResponse(res, result);
  })
);

export default router;
