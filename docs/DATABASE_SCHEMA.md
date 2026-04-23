# Gyan Path Database Schema

## Overview
PostgreSQL database hosted on Supabase with Row Level Security (RLS) enabled on all tables.

---

## Entity Relationship Diagram (Text)

```
users ─────────┬──────────────────────────────────────────────────────────┐
               │                                                          │
               ├──< user_memberships >── membership_plans                 │
               │                                                          │
               ├──< wallets ──< wallet_transactions                       │
               │                                                          │
               ├──< quiz_attempts >── quizzes ──< questions               │
               │         │                                                │
               │         └──< attempt_answers                             │
               │                                                          │
               ├──< leaderboard_entries                                   │
               │                                                          │
               ├──< material_purchases >── materials                      │
               │                                                          │
               ├──< notifications                                         │
               │                                                          │
               ├──< ai_insights                                           │
               │                                                          │
               └──< admin_action_logs (admin users only)                  │
```

---

## Tables

### 1. users
Extends Supabase auth.users with profile data.

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('guest', 'student', 'member', 'contributor', 'admin')),
    class TEXT, -- e.g., '10th', '12th', 'graduate'
    subjects TEXT[], -- array of subject interests
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'both')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_class ON public.users(class);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Trigger for updated_at
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### 2. membership_plans
Available membership plans.

```sql
CREATE TABLE public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'basic', 'premium', 'pro'
    display_name TEXT NOT NULL,
    description TEXT,
    price_inr DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL, -- 30, 90, 365
    benefits JSONB NOT NULL DEFAULT '{}',
    commission_rate DECIMAL(5,4) DEFAULT 0.01, -- 1% to 5%
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample benefits JSONB structure:
-- {
--   "unlimited_quizzes": true,
--   "ai_insights": true,
--   "daily_questions": 10,
--   "material_discount": 0.2,
--   "ad_free": true
-- }
```

### 3. user_memberships
User subscription records.

```sql
CREATE TABLE public.user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_id UUID, -- references transactions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON public.user_memberships(status);
CREATE INDEX idx_user_memberships_expires_at ON public.user_memberships(expires_at);
```

### 4. wallets
User wallet with coin and cash balances.

```sql
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    coin_balance INTEGER NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cash_balance >= 0),
    total_earned_coins INTEGER DEFAULT 0,
    total_spent_coins INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 1000, -- max coins per day
    monthly_limit INTEGER DEFAULT 10000,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
```

### 5. wallet_transactions
Immutable ledger for all wallet operations.

```sql
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'credit_reward', 'credit_commission', 'credit_purchase', 'credit_refund', 'credit_admin',
        'debit_purchase', 'debit_transfer', 'debit_admin', 'debit_expiry'
    )),
    currency TEXT NOT NULL CHECK (currency IN ('coin', 'cash')),
    amount INTEGER NOT NULL, -- positive for credit, negative for debit
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT, -- 'quiz', 'material', 'membership', 'question', etc.
    reference_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable - no updates allowed
CREATE INDEX idx_wallet_txn_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_txn_type ON public.wallet_transactions(type);
CREATE INDEX idx_wallet_txn_created_at ON public.wallet_transactions(created_at);
```

### 6. subjects
Subject master data.

```sql
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    display_name_hi TEXT, -- Hindi name
    icon TEXT,
    color TEXT, -- hex color
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. questions
Question bank with moderation workflow.

```sql
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    created_by UUID NOT NULL REFERENCES public.users(id),
    question_text TEXT NOT NULL,
    question_text_hi TEXT, -- Hindi version
    question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'fill_blank')),
    options JSONB NOT NULL, -- [{id, text, text_hi}]
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    explanation_hi TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    image_url TEXT,
    video_url TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'archived')),
    rejection_reason TEXT,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_daily_eligible BOOLEAN DEFAULT TRUE,
    duplicate_of UUID REFERENCES public.questions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX idx_questions_status ON public.questions(status);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_created_by ON public.questions(created_by);
CREATE INDEX idx_questions_created_at ON public.questions(created_at);
```

### 8. quizzes
Quiz definitions.

```sql
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id),
    mode TEXT NOT NULL CHECK (mode IN ('normal', 'fast', 'rapid_fire', 'extended', 'daily')),
    difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER NOT NULL DEFAULT 10,
    time_limit_seconds INTEGER, -- null for untimed
    passing_score INTEGER DEFAULT 60, -- percentage
    is_official BOOLEAN DEFAULT FALSE, -- admin-created
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_subject_id ON public.quizzes(subject_id);
CREATE INDEX idx_quizzes_mode ON public.quizzes(mode);
CREATE INDEX idx_quizzes_is_active ON public.quizzes(is_active);
```

### 9. quiz_questions
Junction table linking quizzes to questions.

```sql
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(quiz_id, question_id)
);

CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
```

### 10. quiz_attempts
User quiz attempt records.

```sql
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    skipped INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0, -- calculated score with time bonus
    time_taken_seconds INTEGER,
    coins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);
```

### 11. attempt_answers
Individual answers in a quiz attempt.

```sql
CREATE TABLE public.attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id),
    selected_option_id TEXT,
    is_correct BOOLEAN,
    time_taken_ms INTEGER, -- milliseconds to answer
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);
```

### 12. leaderboard_entries
Cached leaderboard rankings.

```sql
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'subject', 'quiz', 'daily', 'weekly', 'monthly')),
    scope_id UUID, -- subject_id or quiz_id if applicable
    period TEXT, -- '2024-01', '2024-W01', '2024-01-15' for time-based
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    accuracy_percent DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scope, scope_id, period)
);

CREATE INDEX idx_leaderboard_scope ON public.leaderboard_entries(scope, scope_id, period);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard_entries(rank);
```

### 13. daily_questions
Track daily question assignments.

```sql
CREATE TABLE public.daily_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id),
    date DATE NOT NULL UNIQUE,
    subject_id UUID REFERENCES public.subjects(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_questions_date ON public.daily_questions(date);
```

### 14. materials
Educational materials for sale.

```sql
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT,
    description_hi TEXT,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'notes', 'video_bundle', 'question_pack')),
    subject_id UUID REFERENCES public.subjects(id),
    class TEXT,
    thumbnail_url TEXT,
    file_url TEXT, -- Supabase storage path
    file_size_bytes INTEGER,
    price_coins INTEGER DEFAULT 0,
    price_cash DECIMAL(10,2) DEFAULT 0,
    is_premium_only BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_subject_id ON public.materials(subject_id);
CREATE INDEX idx_materials_type ON public.materials(type);
CREATE INDEX idx_materials_is_active ON public.materials(is_active);
```

### 15. material_purchases
Purchase records and entitlements.

```sql
CREATE TABLE public.material_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('coins', 'cash', 'free', 'membership')),
    amount_paid INTEGER, -- coins or paisa
    wallet_txn_id UUID REFERENCES public.wallet_transactions(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

CREATE INDEX idx_material_purchases_user_id ON public.material_purchases(user_id);
```

### 16. notifications
User notifications.

```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'quiz_reminder', 'daily_question', 'achievement', 'reward', 
        'membership_expiry', 'system', 'moderation', 'tip'
    )),
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}', -- deep link data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
```

### 17. ai_insights
AI-generated insights and recommendations.

```sql
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'performance_analysis', 'weak_areas', 'recommendations', 
        'generated_notes', 'daily_tip', 'study_plan'
    )),
    subject_id UUID REFERENCES public.subjects(id),
    content JSONB NOT NULL,
    source_data JSONB, -- input data used for generation
    model_version TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample content JSONB for weak_areas:
-- {
--   "weak_topics": ["Algebra", "Trigonometry"],
--   "confidence": 0.85,
--   "recommended_actions": ["Practice more algebra questions", "Review trig formulas"],
--   "improvement_trend": "improving"
-- }

CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(type);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at);
```

### 18. payment_transactions
External payment records (Razorpay).

```sql
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount_paisa INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    purpose TEXT NOT NULL CHECK (purpose IN ('membership', 'material', 'coins', 'other')),
    purpose_id UUID, -- membership plan id or material id
    fee_amount INTEGER DEFAULT 0, -- 2% transaction fee in paisa
    invoice_number TEXT,
    invoice_url TEXT,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_txn_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_txn_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_txn_razorpay_order ON public.payment_transactions(razorpay_order_id);
```

### 19. admin_action_logs
Audit trail for admin operations.

```sql
CREATE TABLE public.admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL, -- 'approve_question', 'block_user', 'adjust_wallet', etc.
    target_type TEXT NOT NULL, -- 'user', 'question', 'wallet', 'material', etc.
    target_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON public.admin_action_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON public.admin_action_logs(action);
CREATE INDEX idx_admin_logs_target ON public.admin_action_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_action_logs(created_at);
```

### 20. user_streaks
Track daily engagement streaks.

```sql
CREATE TABLE public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_type TEXT DEFAULT 'daily_question' CHECK (streak_type IN ('daily_question', 'quiz', 'login')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);
```

---

## Helper Functions

### Updated timestamp trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Auto-create wallet on user signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create wallet for new user
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);
    
    -- Create streak tracker
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

## Row Level Security (RLS) Policies

### Users table

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Wallets table

```sql
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Only server/admin can modify wallets (no direct user updates)
CREATE POLICY "Admins can view all wallets"
    ON public.wallets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Questions table

```sql
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved questions
CREATE POLICY "Anyone can view approved questions"
    ON public.questions FOR SELECT
    USING (status = 'approved');

-- Users can view their own questions
CREATE POLICY "Users can view own questions"
    ON public.questions FOR SELECT
    USING (auth.uid() = created_by);

-- Users can create questions
CREATE POLICY "Users can create questions"
    ON public.questions FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Users can update their own pending questions
CREATE POLICY "Users can update own pending questions"
    ON public.questions FOR UPDATE
    USING (auth.uid() = created_by AND status IN ('draft', 'pending'))
    WITH CHECK (auth.uid() = created_by);

-- Admins have full access
CREATE POLICY "Admins can manage all questions"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Quiz attempts table

```sql
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own attempts
CREATE POLICY "Users can manage own attempts"
    ON public.quiz_attempts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### Notifications table

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## Seed Data

### Initial subjects

```sql
INSERT INTO public.subjects (name, display_name, display_name_hi, icon, color, sort_order) VALUES
('mathematics', 'Mathematics', 'गणित', '🔢', '#4F46E5', 1),
('physics', 'Physics', 'भौतिक विज्ञान', '⚛️', '#0EA5E9', 2),
('chemistry', 'Chemistry', 'रसायन विज्ञान', '🧪', '#10B981', 3),
('biology', 'Biology', 'जीव विज्ञान', '🧬', '#F59E0B', 4),
('english', 'English', 'अंग्रेज़ी', '📖', '#EC4899', 5),
('hindi', 'Hindi', 'हिंदी', '📝', '#8B5CF6', 6),
('history', 'History', 'इतिहास', '🏛️', '#6366F1', 7),
('geography', 'Geography', 'भूगोल', '🌍', '#14B8A6', 8),
('computer_science', 'Computer Science', 'कंप्यूटर विज्ञान', '💻', '#F97316', 9),
('general_knowledge', 'General Knowledge', 'सामान्य ज्ञान', '💡', '#EF4444', 10);
```

### Initial membership plans

```sql
INSERT INTO public.membership_plans (name, display_name, price_inr, duration_days, commission_rate, benefits, sort_order) VALUES
('basic', 'Basic', 99.00, 30, 0.01, '{
    "unlimited_quizzes": false,
    "daily_quiz_limit": 10,
    "ai_insights": false,
    "daily_questions": 3,
    "material_discount": 0,
    "ad_free": false
}', 1),
('premium', 'Premium', 299.00, 30, 0.03, '{
    "unlimited_quizzes": true,
    "daily_quiz_limit": null,
    "ai_insights": true,
    "daily_questions": 10,
    "material_discount": 0.15,
    "ad_free": true
}', 2),
('pro', 'Pro Annual', 1999.00, 365, 0.05, '{
    "unlimited_quizzes": true,
    "daily_quiz_limit": null,
    "ai_insights": true,
    "daily_questions": null,
    "material_discount": 0.25,
    "ad_free": true,
    "priority_support": true
}', 3);
```

---

## Migration Notes

1. Run migrations in order: auth setup → users → wallets → subjects → questions → quizzes → materials → etc.
2. Enable RLS on each table immediately after creation
3. Test RLS policies with different user roles before production
4. Set up database backups in Supabase dashboard
5. Configure connection pooling for production load
