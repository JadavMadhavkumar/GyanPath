import { z } from 'zod';

// AI analysis request schema
export const aiAnalysisSchema = z.object({
  type: z.enum([
    'performance_analysis',
    'weak_areas',
    'recommendations',
    'generated_notes',
    'daily_tip',
    'study_plan',
  ]),
  subject_id: z.string().uuid().optional(),
  custom_prompt: z.string().max(500).optional(),
});

export type AIAnalysisRequest = z.infer<typeof aiAnalysisSchema>;
