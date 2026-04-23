import { z } from 'zod';

// Question option schema
const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Option text is required'),
  text_hi: z.string().optional(),
});

// Create question validator
export const createQuestionSchema = z.object({
  subject_id: z.string().uuid('Invalid subject'),
  question_text: z.string().min(10, 'Question must be at least 10 characters').max(1000),
  question_text_hi: z.string().max(1000).optional().nullable(),
  question_type: z.enum(['mcq', 'true_false', 'fill_blank']).default('mcq'),
  options: z.array(questionOptionSchema).min(2, 'At least 2 options required').max(6),
  correct_option_id: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().max(500).optional().nullable(),
  explanation_hi: z.string().max(500).optional().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
}).refine(
  (data) => data.options.some(opt => opt.id === data.correct_option_id),
  { message: 'Correct option must be one of the provided options' }
);

// Start quiz validator
export const startQuizSchema = z.object({
  subject_id: z.string().uuid().optional(),
  mode: z.enum(['normal', 'fast', 'rapid_fire', 'extended', 'daily']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  question_count: z.number().int().min(5).max(50).default(10),
});

// Submit answer validator
export const submitAnswerSchema = z.object({
  attempt_id: z.string().uuid(),
  question_id: z.string().uuid(),
  selected_option_id: z.string().nullable(),
  time_taken_ms: z.number().int().min(0).max(300000), // Max 5 minutes
});

// Complete quiz validator
export const completeQuizSchema = z.object({
  attempt_id: z.string().uuid(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type CompleteQuizInput = z.infer<typeof completeQuizSchema>;
