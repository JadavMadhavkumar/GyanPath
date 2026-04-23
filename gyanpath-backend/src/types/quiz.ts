// Quiz and Question types
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';

export type QuizMode = 'normal' | 'fast' | 'rapid_fire' | 'extended' | 'daily';

export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuizAttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

export interface QuestionOption {
  id: string;
  text: string;
  text_hi?: string;
}

export interface Question {
  id: string;
  subject_id: string;
  created_by: string;
  question_text: string;
  question_text_hi?: string | null;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_option_id: string;
  explanation?: string | null;
  explanation_hi?: string | null;
  difficulty: QuestionDifficulty;
  image_url?: string | null;
  video_url?: string | null;
  tags?: string[] | null;
  status: QuestionStatus;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  usage_count: number;
  is_daily_eligible: boolean;
  duplicate_of?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionInput {
  subject_id: string;
  question_text: string;
  question_text_hi?: string;
  question_type?: QuestionType;
  options: QuestionOption[];
  correct_option_id: string;
  explanation?: string;
  explanation_hi?: string;
  difficulty?: QuestionDifficulty;
  image_url?: string;
  video_url?: string;
  tags?: string[];
}

export interface UpdateQuestionInput {
  question_text?: string;
  question_text_hi?: string;
  options?: QuestionOption[];
  correct_option_id?: string;
  explanation?: string;
  explanation_hi?: string;
  difficulty?: QuestionDifficulty;
  tags?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  title_hi?: string | null;
  description?: string | null;
  subject_id?: string | null;
  mode: QuizMode;
  difficulty: QuizDifficulty;
  question_count: number;
  time_limit_seconds?: number | null;
  passing_score: number;
  is_official: boolean;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuizInput {
  title: string;
  title_hi?: string;
  description?: string;
  subject_id?: string;
  mode: QuizMode;
  difficulty?: QuizDifficulty;
  question_count: number;
  time_limit_seconds?: number;
  passing_score?: number;
  is_official?: boolean;
  starts_at?: string;
  ends_at?: string;
  question_ids?: string[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_id: string;
  sort_order: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  status: QuizAttemptStatus;
  started_at: string;
  completed_at?: string | null;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  score: number;
  time_taken_seconds?: number | null;
  coins_earned: number;
  created_at: string;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  is_correct?: boolean | null;
  time_taken_ms?: number | null;
  answered_at: string;
}

export interface QuizResult {
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  score: number;
  time_taken_seconds: number;
  coins_earned: number;
  rank?: number;
  answers: {
    question_id: string;
    selected?: string | null;
    correct: string;
    is_correct: boolean;
    explanation?: string;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  scope: 'global' | 'subject' | 'quiz' | 'daily' | 'weekly' | 'monthly';
  scope_id?: string | null;
  period?: string | null;
  rank: number;
  score: number;
  total_attempts: number;
  accuracy_percent?: number | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface DailyQuestion {
  id: string;
  question_id: string;
  date: string; // DATE
  subject_id?: string | null;
  is_active: boolean;
  created_at: string;
  question?: Question;
}

// Quiz mode time limits
export const QUIZ_MODE_TIME_LIMITS: Record<QuizMode, number | null> = {
  normal: 30, // 30 seconds per question
  fast: 15, // 15 seconds per question
  rapid_fire: 5, // 5 seconds per question
  extended: 60, // 60 seconds per question
  daily: null, // No time limit for daily quiz
};

// Scoring formula constants
export const SCORING = {
  BASE_SCORE_PER_CORRECT: 10,
  MAX_TIME_BONUS: 5,
  COIN_DIVISOR: 10,
};
