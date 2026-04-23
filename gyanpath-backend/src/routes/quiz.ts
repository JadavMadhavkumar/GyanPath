import { Router } from 'express';
import { quizService } from '../services/quizService';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import {
  createQuestionSchema,
  updateQuestionSchema,
  approveQuestionSchema,
  createQuizSchema,
  startQuizSchema,
  submitAnswerSchema,
  completeQuizSchema,
  getQuestionsSchema,
  leaderboardSchema,
} from '../validators/quiz';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';
import { successResponse, createdResponse } from '../utils/response';

const router = Router();

/**
 * GET /api/v1/quiz/subjects
 * Get all subjects
 */
router.get(
  '/subjects',
  asyncHandler(async (req, res) => {
    const subjects = await quizService.getSubjects();
    return successResponse(res, subjects);
  })
);

/**
 * GET /api/v1/quiz/questions
 * Get approved questions for quizzes
 */
router.get(
  '/questions',
  validateQuery(getQuestionsSchema),
  asyncHandler(async (req, res) => {
    const questions = await quizService.getQuestions(req.query as any);
    return successResponse(res, questions);
  })
);

/**
 * POST /api/v1/quiz/questions
 * Create a question (membership required)
 */
router.post(
  '/questions',
  authMiddleware,
  validateBody(createQuestionSchema),
  asyncHandler(async (req, res) => {
    const question = await quizService.createQuestion(req.userId!, req.body);
    return createdResponse(res, question);
  })
);

/**
 * PUT /api/v1/quiz/questions/:questionId
 * Update question (owner only, if pending)
 */
router.put(
  '/questions/:questionId',
  authMiddleware,
  validateParams(validateParams),
  validateBody(updateQuestionSchema),
  asyncHandler(async (req, res) => {
    const question = await quizService.updateQuestion(
      req.params.questionId,
      req.userId!,
      req.body
    );
    return successResponse(res, question);
  })
);

/**
 * GET /api/v1/quiz/questions/pending
 * Get pending questions (admin only)
 */
router.get(
  '/questions/pending',
  authMiddleware,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await quizService.getPendingQuestions(page, limit);
    return successResponse(res, result);
  })
);

/**
 * POST /api/v1/quiz/questions/:questionId/approve
 * Approve/reject question (admin only)
 */
router.post(
  '/questions/:questionId/approve',
  authMiddleware,
  requireRole('admin'),
  validateBody(approveQuestionSchema),
  asyncHandler(async (req, res) => {
    const question = await quizService.approveQuestion(
      req.params.questionId,
      req.body.status,
      req.userId!,
      req.body.rejection_reason
    );
    return successResponse(res, question);
  })
);

/**
 * POST /api/v1/quiz/create
 * Create a quiz
 */
router.post(
  '/create',
  authMiddleware,
  validateBody(createQuizSchema),
  asyncHandler(async (req, res) => {
    const quiz = await quizService.createQuiz(req.body, req.userId!);
    return createdResponse(res, quiz);
  })
);

/**
 * GET /api/v1/quiz/:quizId
 * Get quiz details
 */
router.get(
  '/:quizId',
  asyncHandler(async (req, res) => {
    const quiz = await quizService.getQuiz(req.params.quizId);
    return successResponse(res, quiz);
  })
);

/**
 * POST /api/v1/quiz/:quizId/start
 * Start quiz attempt
 */
router.post(
  '/:quizId/start',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const attempt = await quizService.startAttempt(req.userId!, req.params.quizId);
    return createdResponse(res, attempt);
  })
);

/**
 * POST /api/v1/quiz/attempt/:attemptId/answer
 * Submit answer for quiz
 */
router.post(
  '/attempt/:attemptId/answer',
  authMiddleware,
  validateBody(submitAnswerSchema),
  asyncHandler(async (req, res) => {
    const answer = await quizService.submitAnswer(
      req.params.attemptId,
      req.body.question_id,
      req.body.selected_option_id || null,
      req.body.time_taken_ms
    );
    return createdResponse(res, answer);
  })
);

/**
 * POST /api/v1/quiz/attempt/:attemptId/complete
 * Complete quiz and get results
 */
router.post(
  '/attempt/:attemptId/complete',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await quizService.completeQuiz(req.params.attemptId, req.userId!);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/quiz/leaderboard
 * Get leaderboard
 */
router.get(
  '/leaderboard',
  validateQuery(leaderboardSchema),
  asyncHandler(async (req, res) => {
    const leaderboard = await quizService.getLeaderboard(req.query as any);
    return successResponse(res, leaderboard);
  })
);

/**
 * GET /api/v1/quiz/daily
 * Get daily question
 */
router.get(
  '/daily',
  asyncHandler(async (req, res) => {
    const dailyQuestion = await quizService.getDailyQuestion();
    return successResponse(res, dailyQuestion);
  })
);

/**
 * GET /api/v1/quiz/my-attempts
 * Get user's quiz attempts
 */
router.get(
  '/my-attempts',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query as any;
    const result = await quizService.getUserAttempts(req.userId!, limit, offset);
    return successResponse(res, result);
  })
);

/**
 * GET /api/v1/quiz/my-questions
 * Get user's created questions
 */
router.get(
  '/my-questions',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query as any;
    const supabase = (await import('../lib/supabase')).getSupabaseAdmin();

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('questions')
      .select('*')
      .eq('created_by', req.userId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return successResponse(res, {
      questions: data,
      total: count || 0,
      page,
      limit,
    });
  })
);

export default router;
