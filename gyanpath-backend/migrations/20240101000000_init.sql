-- Gyan Path Database Schema Migration
-- Version: 20240101000000_init

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('guest', 'student', 'member', 'contributor', 'admin')),
    class TEXT,
    subjects TEXT[],
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'both')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_class ON public.users(class);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Membership plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_inr DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    benefits JSONB NOT NULL DEFAULT '{}',
    commission_rate DECIMAL(5,4) DEFAULT 0.01,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User memberships
CREATE TABLE IF NOT EXISTS public.user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON public.user_memberships(status);
CREATE INDEX idx_user_memberships_expires_at ON public.user_memberships(expires_at);

-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    coin_balance INTEGER NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cash_balance >= 0),
    total_earned_coins INTEGER DEFAULT 0,
    total_spent_coins INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 10000,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);

-- Wallet transactions (immutable ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'credit_reward', 'credit_commission', 'credit_purchase', 'credit_refund', 'credit_admin',
        'debit_purchase', 'debit_transfer', 'debit_admin', 'debit_expiry'
    )),
    currency TEXT NOT NULL CHECK (currency IN ('coin', 'cash')),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_txn_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_txn_type ON public.wallet_transactions(type);
CREATE INDEX idx_wallet_txn_created_at ON public.wallet_transactions(created_at);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    display_name_hi TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    created_by UUID NOT NULL REFERENCES public.users(id),
    question_text TEXT NOT NULL,
    question_text_hi TEXT,
    question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'fill_blank')),
    options JSONB NOT NULL,
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

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id),
    mode TEXT NOT NULL CHECK (mode IN ('normal', 'fast', 'rapid_fire', 'extended', 'daily')),
    difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER NOT NULL DEFAULT 10,
    time_limit_seconds INTEGER,
    passing_score INTEGER DEFAULT 60,
    is_official BOOLEAN DEFAULT FALSE,
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

-- Quiz questions (junction table)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(quiz_id, question_id)
);

CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
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
    score INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    coins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);

-- Attempt answers
CREATE TABLE IF NOT EXISTS public.attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id),
    selected_option_id TEXT,
    is_correct BOOLEAN,
    time_taken_ms INTEGER,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'subject', 'quiz', 'daily', 'weekly', 'monthly')),
    scope_id UUID,
    period TEXT,
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

-- Daily questions
CREATE TABLE IF NOT EXISTS public.daily_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id),
    date DATE NOT NULL UNIQUE,
    subject_id UUID REFERENCES public.subjects(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_questions_date ON public.daily_questions(date);

-- Materials
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT,
    description_hi TEXT,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'notes', 'video_bundle', 'question_pack')),
    subject_id UUID REFERENCES public.subjects(id),
    class TEXT,
    thumbnail_url TEXT,
    file_url TEXT,
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

-- Material purchases
CREATE TABLE IF NOT EXISTS public.material_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('coins', 'cash', 'free', 'membership')),
    amount_paid INTEGER,
    wallet_txn_id UUID REFERENCES public.wallet_transactions(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

CREATE INDEX idx_material_purchases_user_id ON public.material_purchases(user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'quiz_reminder', 'daily_question', 'achievement', 'reward',
        'membership_expiry', 'system', 'moderation', 'tip',
        'admission_open', 'new_feature', 'battle_invite', 'group_announcement',
        'question_approved', 'commission_earned', 'referral_joined', 'scholarship_available'
    )),
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- AI insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'performance_analysis', 'weak_areas', 'recommendations',
        'generated_notes', 'daily_tip', 'study_plan'
    )),
    subject_id UUID REFERENCES public.subjects(id),
    content JSONB NOT NULL,
    source_data JSONB,
    model_version TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(type);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at);

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount_paisa INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    purpose TEXT NOT NULL CHECK (purpose IN ('membership', 'material', 'coins', 'other')),
    purpose_id UUID,
    fee_amount INTEGER DEFAULT 0,
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

-- Admin action logs
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
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

-- User streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
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

-- Groups (for community)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('subject', 'school', 'class', 'career', 'general')),
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 1,
    requires_approval BOOLEAN DEFAULT FALSE,
    membership_plan_required TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_type ON public.groups(type);
CREATE INDEX idx_groups_created_by ON public.groups(created_by);

-- Group members
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- Group messages
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'quiz_link', 'material_link')),
    media_url TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'deleted')),
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON public.group_messages(created_at);

-- Group invites
CREATE TABLE IF NOT EXISTS public.group_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.users(id),
    invitee_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE(group_id, invitee_id, status)
);

-- Wallet transaction helper function
CREATE OR REPLACE FUNCTION public.perform_wallet_transaction(
    p_wallet_id UUID,
    p_user_id UUID,
    p_type TEXT,
    p_currency TEXT,
    p_amount INTEGER,
    p_balance_before INTEGER,
    p_balance_after INTEGER,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_new_coin_balance INTEGER DEFAULT NULL,
    p_new_cash_balance INTEGER DEFAULT NULL,
    p_add_to_earned INTEGER DEFAULT 0,
    p_add_to_spent INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    v_txn_id UUID;
BEGIN
    -- Insert transaction record
    INSERT INTO public.wallet_transactions (
        wallet_id, user_id, type, currency, amount,
        balance_before, balance_after, reference_type, reference_id,
        description, metadata
    ) VALUES (
        p_wallet_id, p_user_id, p_type, p_currency, p_amount,
        p_balance_before, p_balance_after, p_reference_type, p_reference_id,
        p_description, p_metadata
    ) RETURNING id INTO v_txn_id;

    -- Update wallet balance
    UPDATE public.wallets
    SET
        coin_balance = COALESCE(p_new_coin_balance, coin_balance),
        cash_balance = COALESCE(p_new_cash_balance, cash_balance),
        total_earned_coins = total_earned_coins + p_add_to_earned,
        total_spent_coins = total_spent_coins + p_add_to_spent,
        updated_at = NOW()
    WHERE id = p_wallet_id;

    RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create wallet and streak on user signup
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
