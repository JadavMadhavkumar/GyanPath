// Quiz types
export type QuizMode = 'normal' | 'fast' | 'rapid_fire' | 'extended' | 'daily';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuestionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

export interface Subject {
  id: string;
  name: string;
  display_name: string;
  display_name_hi: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

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
  question_text_hi: string | null;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_option_id: string;
  explanation: string | null;
  explanation_hi: string | null;
  difficulty: Difficulty;
  image_url: string | null;
  video_url: string | null;
  tags: string[];
  status: QuestionStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  usage_count: number;
  is_daily_eligible: boolean;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  subject?: Subject;
}

// Question without correct answer (for quiz display)
export interface QuestionDisplay extends Omit<Question, 'correct_option_id' | 'explanation' | 'explanation_hi'> {}

export interface Quiz {
  id: string;
  title: string;
  title_hi: string | null;
  description: string | null;
  subject_id: string | null;
  mode: QuizMode;
  difficulty: Difficulty;
  question_count: number;
  time_limit_seconds: number | null;
  passing_score: number;
  is_official: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  subject?: Subject;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  status: AttemptStatus;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  score: number;
  time_taken_seconds: number | null;
  coins_earned: number;
  created_at: string;
  // Joined
  quiz?: Quiz;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean | null;
  time_taken_ms: number | null;
  answered_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  scope: 'global' | 'subject' | 'quiz' | 'daily' | 'weekly' | 'monthly';
  scope_id: string | null;
  period: string | null;
  rank: number;
  score: number;
  total_attempts: number;
  accuracy_percent: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface DailyQuestion {
  id: string;
  question_id: string;
  date: string;
  subject_id: string | null;
  is_active: boolean;
  created_at: string;
  // Joined
  question?: Question;
}

// Quiz mode configurations
export const QUIZ_MODE_CONFIG: Record<QuizMode, {
  label: string;
  timePerQuestion: number;
  description: string;
}> = {
  normal: {
    label: 'Normal',
    timePerQuestion: 30,
    description: '30 seconds per question'
  },
  fast: {
    label: 'Fast',
    timePerQuestion: 15,
    description: '15 seconds per question'
  },
  rapid_fire: {
    label: 'Rapid Fire',
    timePerQuestion: 5,
    description: '5 seconds per question (Phase 2)'
  },
  extended: {
    label: 'Extended',
    timePerQuestion: 60,
    description: '60 seconds per question (Phase 2)'
  },
  daily: {
    label: 'Daily Challenge',
    timePerQuestion: 30,
    description: 'Daily question of the day'
  }
};
