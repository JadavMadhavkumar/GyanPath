import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // Expo Push
  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN || '',
  },

  // App
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    mobileDeepLinkScheme: process.env.MOBILE_DEEP_LINK_SCHEME || 'gyanpath',
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    dir: process.env.UPLOAD_DIR || './uploads',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Coin/Reward Configuration
  rewards: {
    dailyCoinLimit: parseInt(process.env.DAILY_COIN_LIMIT || '1000', 10),
    monthlyCoinLimit: parseInt(process.env.MONTHLY_COIN_LIMIT || '10000', 10),
    quizCoinMultiplier: parseInt(process.env.QUIZ_COIN_MULTIPLIER || '1', 10),
    membershipCoinBonus: {
      basic: parseInt(process.env.MEMBERSHIP_COIN_BONUS_BASIC || '100', 10),
      premium: parseInt(process.env.MEMBERSHIP_COIN_BONUS_PREMIUM || '500', 10),
      pro: parseInt(process.env.MEMBERSHIP_COIN_BONUS_PRO || '2000', 10),
    },
  },

  // Transaction Fee
  transactionFeePercent: parseFloat(process.env.TRANSACTION_FEE_PERCENT || '2'),

  // Commission Rates
  commission: {
    questionCommissionRate: parseFloat(process.env.QUESTION_COMMISSION_RATE || '0.01'),
    membershipCommissionRate: parseFloat(process.env.MEMBERSHIP_COMMISSION_RATE || '0.03'),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || './logs/app.log',
  },
};
