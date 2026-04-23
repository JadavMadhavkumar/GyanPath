// Re-export all types
export * from './user';
export * from './membership';
export * from './wallet';
export * from './quiz';
export * from './material';
export * from './notification';
export * from './ai';
export * from './admin';

// Common API response types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Supabase database types (generated from schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: import('./user').User;
        Insert: Omit<import('./user').User, 'created_at' | 'updated_at'>;
        Update: Partial<import('./user').User>;
      };
      membership_plans: {
        Row: import('./membership').MembershipPlan;
        Insert: Omit<import('./membership').MembershipPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./membership').MembershipPlan>;
      };
      user_memberships: {
        Row: import('./membership').UserMembership;
        Insert: Omit<import('./membership').UserMembership, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./membership').UserMembership>;
      };
      wallets: {
        Row: import('./wallet').Wallet;
        Insert: Omit<import('./wallet').Wallet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./wallet').Wallet>;
      };
      wallet_transactions: {
        Row: import('./wallet').WalletTransaction;
        Insert: Omit<import('./wallet').WalletTransaction, 'id' | 'created_at'>;
        Update: never; // Immutable
      };
      subjects: {
        Row: import('./quiz').Subject;
        Insert: Omit<import('./quiz').Subject, 'id' | 'created_at'>;
        Update: Partial<import('./quiz').Subject>;
      };
      questions: {
        Row: import('./quiz').Question;
        Insert: Omit<import('./quiz').Question, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./quiz').Question>;
      };
      quizzes: {
        Row: import('./quiz').Quiz;
        Insert: Omit<import('./quiz').Quiz, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./quiz').Quiz>;
      };
      quiz_attempts: {
        Row: import('./quiz').QuizAttempt;
        Insert: Omit<import('./quiz').QuizAttempt, 'id' | 'created_at'>;
        Update: Partial<import('./quiz').QuizAttempt>;
      };
      materials: {
        Row: import('./material').Material;
        Insert: Omit<import('./material').Material, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<import('./material').Material>;
      };
      notifications: {
        Row: import('./notification').Notification;
        Insert: Omit<import('./notification').Notification, 'id' | 'created_at'>;
        Update: Partial<import('./notification').Notification>;
      };
      ai_insights: {
        Row: import('./ai').AIInsight;
        Insert: Omit<import('./ai').AIInsight, 'id' | 'created_at'>;
        Update: Partial<import('./ai').AIInsight>;
      };
      admin_action_logs: {
        Row: import('./admin').AdminActionLog;
        Insert: Omit<import('./admin').AdminActionLog, 'id' | 'created_at'>;
        Update: never; // Immutable
      };
    };
  };
}
