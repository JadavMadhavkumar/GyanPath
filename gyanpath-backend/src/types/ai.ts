// AI Insight types
export type AIInsightType =
  | 'performance_analysis'
  | 'weak_areas'
  | 'recommendations'
  | 'generated_notes'
  | 'daily_tip'
  | 'study_plan';

export interface AIInsight {
  id: string;
  user_id: string;
  type: AIInsightType;
  subject_id?: string | null;
  content: Record<string, any>;
  source_data?: Record<string, any> | null;
  model_version?: string | null;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

// Performance analysis content structure
export interface PerformanceAnalysis {
  overall_score: number;
  trend: 'improving' | 'stable' | 'declining';
  subjects: {
    name: string;
    accuracy: number;
    attempts: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  summary: string;
}

// Weak areas content structure
export interface WeakAreas {
  weak_topics: {
    subject: string;
    topic: string;
    accuracy: number;
    recommendation: string;
  }[];
  recommended_actions: string[];
  confidence: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
}

// Recommendations content structure
export interface AIRecommendations {
  quizzes: {
    id: string;
    title: string;
    reason: string;
  }[];
  materials: {
    id: string;
    title: string;
    reason: string;
  }[];
  study_focus: string[];
}

// Daily tip content structure
export interface DailyTip {
  tip: string;
  category: 'study' | 'motivation' | 'strategy' | 'health';
  action_items: string[];
}

// Study plan content structure
export interface StudyPlan {
  duration_days: number;
  daily_goals: string[];
  focus_areas: string[];
  milestones: {
    day: number;
    goal: string;
  }[];
  estimated_improvement: string;
}

// AI Analysis request
export interface AIAnalysisRequest {
  type: AIInsightType;
  subject_id?: string;
  custom_prompt?: string;
}

// AI Analysis rate limits
export const AI_RATE_LIMITS = {
  MAX_REQUESTS_PER_USER_PER_DAY: 5,
  CACHE_TTL_HOURS: 24,
};
