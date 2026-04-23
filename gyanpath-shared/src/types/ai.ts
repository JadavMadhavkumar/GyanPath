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
  subject_id: string | null;
  content: AIInsightContent;
  source_data: Record<string, unknown> | null;
  model_version: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

// Specific content types for each insight type
export interface PerformanceAnalysisContent {
  overall_score: number;
  trend: 'improving' | 'declining' | 'stable';
  subjects: {
    name: string;
    accuracy: number;
    attempts: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  summary: string;
}

export interface WeakAreasContent {
  weak_topics: {
    subject: string;
    topic: string;
    accuracy: number;
    recommendation: string;
  }[];
  recommended_actions: string[];
}

export interface RecommendationsContent {
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
}

export interface GeneratedNotesContent {
  topic: string;
  notes: string;
  key_points: string[];
  summary: string;
}

export interface DailyTipContent {
  tip: string;
  category: 'study' | 'motivation' | 'technique' | 'health';
  action?: string;
}

export interface StudyPlanContent {
  days: {
    day: number;
    tasks: {
      subject: string;
      task: string;
      duration_minutes: number;
    }[];
  }[];
  goal: string;
}

export type AIInsightContent =
  | PerformanceAnalysisContent
  | WeakAreasContent
  | RecommendationsContent
  | GeneratedNotesContent
  | DailyTipContent
  | StudyPlanContent;
