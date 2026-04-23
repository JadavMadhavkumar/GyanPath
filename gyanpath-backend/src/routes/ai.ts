import { Router } from 'express';
import { aiService } from '../services/aiService';
import { validateBody } from '../middleware/validation';
import { aiAnalysisSchema } from '../validators/ai';
import { authMiddleware } from '../middleware/auth';
import { aiAnalysisRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

const router = Router();

/**
 * POST /api/v1/ai/analyze
 * Get AI analysis/insights
 */
router.post(
  '/analyze',
  authMiddleware,
  aiAnalysisRateLimiter,
  validateBody(aiAnalysisSchema),
  asyncHandler(async (req, res) => {
    const content = await aiService.analyzePerformance(
      req.userId!,
      req.body.type,
      req.body.subject_id
    );
    return successResponse(res, content);
  })
);

/**
 * GET /api/v1/ai/insights
 * Get user's AI insights
 */
router.get(
  '/insights',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { type, limit = 10 } = req.query as any;
    const insights = await aiService.getUserInsights(req.userId!, type, limit);
    return successResponse(res, insights);
  })
);

/**
 * POST /api/v1/ai/daily-tip
 * Get daily study tip
 */
router.post(
  '/daily-tip',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const tip = await aiService.analyzePerformance(req.userId!, 'daily_tip');
    return successResponse(res, tip);
  })
);

/**
 * POST /api/v1/ai/study-plan
 * Generate study plan
 */
router.post(
  '/study-plan',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const plan = await aiService.analyzePerformance(req.userId!, 'study_plan');
    return successResponse(res, plan);
  })
);

export default router;
