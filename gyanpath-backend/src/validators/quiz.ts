import { z } from 'zod';

// Question option schema
const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  text_hi: z.string().optional(),
});

// Question type enum
const questionTypeEnum = z.enum(['mcq', 'true_false', 'fill_blank']);
const questionDifficultyEnum = z.enum(['easy', 'medium', 'hard']);
const questionStatusEnum = z.enum(['draft', 'pending', 'approved', 'rejected', 'archived']);

// Quiz mode enum
const quizModeEnum = z.enum(['normal', 'fast', 'rapid_fire', 'extended', 'daily']);
const quizDifficultyEnum = z.enum(['easy', 'medium', 'hard', 'mixed']);

// Create question schema
export const createQuestionSchema = z.object({
  subject_id: z.string().uuid('Invalid subject ID'),
  question_text: z.string().min(10, 'Question text must be at least 10 characters').max(2000),
  question_text_hi: z.string().optional(),
  question_type: questionTypeEnum.default('mcq'),
  options: z.array(questionOptionSchema).min(2).max(6),
  correct_option_id: z.string(),
  explanation: z.string().max(1000).optional(),
  explanation_hi: z.string().optional(),
  difficulty: questionDifficultyEnum.default('medium'),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

// Update question schema
export const updateQuestionSchema = z.object({
  question_text: z.string().min(10).max(2000).optional(),
  question_text_hi: z.string().optional(),
  options: z.array(questionOptionSchema).min(2).max(6).optional(),
  correct_option_id: z.string().optional(),
  explanation: z.string().max(1000).optional(),
  explanation_hi: z.string().optional(),
  difficulty: questionDifficultyEnum.optional(),
  tags: z.array(z.string()).optional(),
});

// Question approval schema
export const approveQuestionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
});

// Create quiz schema
export const createQuizSchema = z.object({
  title: z.string().min(3).max(200),
  title_hi: z.string().optional(),
  description: z.string().optional(),
  subject_id: z.string().uuid().optional(),
  mode: quizModeEnum,
  difficulty: quizDifficultyEnum.default('mixed'),
  question_count: z.number().int().min(1).max(100),
  time_limit_seconds: z.number().int().min(10).optional(),
  passing_score: z.number().int().min(0).max(100).default(60),
  is_official: z.boolean().default(false),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  question_ids: z.array(z.string().uuid()).optional(),
});

// Start quiz attempt schema
export const startQuizSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
});

// Submit answer schema
export const submitAnswerSchema = z.object({
  attempt_id: z.string().uuid('Invalid attempt ID'),
  question_id: z.string().uuid('Invalid question ID'),
  selected_option_id: z.string().optional(),
  time_taken_ms: z.number().int().min(0),
});

// Complete quiz schema
export const completeQuizSchema = z.object({
  attempt_id: z.string().uuid('Invalid attempt ID'),
});

// Get questions schema
export const getQuestionsSchema = z.object({
  subject_id: z.string().uuid().optional(),
  difficulty: questionDifficultyEnum.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Leaderboard schema
export const leaderboardSchema = z.object({
  scope: z.enum(['global', 'subject', 'quiz', 'daily', 'weekly', 'monthly']),
  scope_id: z.string().uuid().optional(),
  period: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ApproveQuestionInput = z.infer<typeof approveQuestionSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type GetQuestionsInput = z.infer<typeof getQuestionsSchema>;
export type LeaderboardInput = z.infer<typeof leaderboardSchema>;
