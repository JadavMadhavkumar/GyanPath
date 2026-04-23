// App configuration
export const APP_CONFIG = {
  name: 'Gyan Path',
  version: '1.0.0',
  supportEmail: 'support@gyanpath.com',
  
  // Wallet
  defaultDailyLimit: 1000,
  defaultMonthlyLimit: 10000,
  transactionFeePercent: 0.02, // 2%
  
  // Quiz
  defaultQuestionsPerQuiz: 10,
  minScoreForCoins: 50, // Minimum score percentage to earn coins
  coinsPerCorrectAnswer: 5,
  
  // AI
  aiCacheHours: 24,
  maxAiRequestsPerDay: 5,
  
  // Content
  maxQuestionsPerDay: 10, // Max user-submitted questions
  maxFileSizeMB: 50,
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

// Feature flags
export const FEATURES = {
  // Phase 1 (MVP)
  normalQuiz: true,
  fastQuiz: true,
  dailyQuestions: true,
  basicWallet: true,
  membership: true,
  materials: true,
  aiInsights: true,
  notifications: true,
  
  // Phase 2
  rapidFireQuiz: false,
  extendedQuiz: false,
  multiplayer: false,
  communityGroups: false,
  cashout: false,
  videoContent: false,
  
  // Phase 3
  advancedFraud: false,
  richNotebook: false,
  referrals: false,
} as const;

// Supported languages
export const LANGUAGES = {
  en: { label: 'English', nativeLabel: 'English' },
  hi: { label: 'Hindi', nativeLabel: 'हिंदी' },
} as const;

// Class/grade options
export const CLASSES = [
  { value: '6th', label: 'Class 6' },
  { value: '7th', label: 'Class 7' },
  { value: '8th', label: 'Class 8' },
  { value: '9th', label: 'Class 9' },
  { value: '10th', label: 'Class 10' },
  { value: '11th', label: 'Class 11' },
  { value: '12th', label: 'Class 12' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'other', label: 'Other' },
] as const;

export type ClassValue = typeof CLASSES[number]['value'];
