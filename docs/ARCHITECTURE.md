# Gyan Path Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
├─────────────────────────────────┬───────────────────────────────────────────┤
│      Mobile App (Expo)          │         Admin Panel (Next.js)             │
│   - iOS / Android               │        - Web Dashboard                    │
│   - Student features            │        - Admin operations                 │
└───────────────┬─────────────────┴──────────────────┬────────────────────────┘
                │                                     │
                │         HTTPS / WebSocket           │
                ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SUPABASE PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Supabase   │  │   Supabase   │  │   Supabase   │  │   Supabase   │    │
│  │     Auth     │  │   Database   │  │   Storage    │  │   Realtime   │    │
│  │              │  │  (Postgres)  │  │   (S3-like)  │  │ (WebSocket)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Edge Functions (Deno)                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │ Quiz       │ │ Wallet     │ │ Payment    │ │ AI         │        │   │
│  │  │ Scoring    │ │ Operations │ │ Webhooks   │ │ Analysis   │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                        │   │
│  │  │ Duplicate  │ │ Notif      │ │ Cron Jobs  │                        │   │
│  │  │ Detection  │ │ Trigger    │ │ (scheduled)│                        │   │
│  │  └────────────┘ └────────────┘ └────────────┘                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                │                                     │
                ▼                                     ▼
┌───────────────────────────────┐    ┌───────────────────────────────┐
│        External APIs          │    │       External Services        │
├───────────────────────────────┤    ├───────────────────────────────┤
│  • Razorpay (Payments)        │    │  • Expo Push (Notifications)  │
│  • OpenAI (AI Features)       │    │  • PostHog (Analytics)        │
└───────────────────────────────┘    └───────────────────────────────┘
```

---

## Repository Structure

### 1. gyanpath-shared
Shared code between mobile and admin apps.

```
gyanpath-shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── quiz.ts
│   │   ├── wallet.ts
│   │   ├── membership.ts
│   │   ├── material.ts
│   │   ├── notification.ts
│   │   ├── ai.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts          # Client initialization
│   │   ├── supabase-admin.ts    # Service role client
│   │   └── api.ts               # API helpers
│   ├── constants/
│   │   ├── config.ts            # App config
│   │   ├── quiz-modes.ts        # Quiz mode definitions
│   │   ├── roles.ts             # User roles
│   │   └── index.ts
│   ├── validators/
│   │   ├── user.ts              # Zod schemas
│   │   ├── quiz.ts
│   │   ├── wallet.ts
│   │   └── index.ts
│   └── index.ts
└── README.md
```

### 2. gyanpath-mobile
Expo React Native mobile app.

```
gyanpath-mobile/
├── package.json
├── tsconfig.json
├── app.json
├── eas.json
├── .env.example
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Splash/redirect
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── quiz.tsx
│   │   ├── wallet.tsx
│   │   ├── materials.tsx
│   │   └── profile.tsx
│   ├── quiz/
│   │   ├── [mode].tsx           # Quiz mode selection
│   │   ├── play/[id].tsx        # Quiz gameplay
│   │   └── results/[id].tsx     # Quiz results
│   ├── material/
│   │   └── [id].tsx             # Material detail
│   ├── membership/
│   │   ├── plans.tsx
│   │   └── checkout.tsx
│   ├── insights/
│   │   └── index.tsx            # AI insights
│   └── settings/
│       └── index.tsx
├── src/
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── quiz/                # Quiz-specific components
│   │   ├── wallet/              # Wallet components
│   │   └── common/              # Shared components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuiz.ts
│   │   ├── useWallet.ts
│   │   └── useNotifications.ts
│   ├── stores/
│   │   ├── authStore.ts         # Zustand auth store
│   │   ├── quizStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── quiz.ts
│   │   ├── wallet.ts
│   │   ├── membership.ts
│   │   ├── razorpay.ts
│   │   └── notifications.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── storage.ts
│   │   └── errors.ts
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       └── index.ts
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
└── README.md
```

### 3. gyanpath-admin
Next.js admin panel.

```
gyanpath-admin/
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Redirect to dashboard
│   ├── login/
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Dashboard shell
│   │   ├── page.tsx             # Overview
│   │   ├── users/
│   │   │   ├── page.tsx         # User list
│   │   │   └── [id]/page.tsx    # User detail
│   │   ├── questions/
│   │   │   ├── page.tsx         # Question queue
│   │   │   └── [id]/page.tsx    # Question detail
│   │   ├── quizzes/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── memberships/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   ├── wallets/
│   │   │   └── page.tsx
│   │   ├── materials/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       └── [...path]/route.ts   # API proxy if needed
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/
│   ├── users/
│   ├── questions/
│   └── charts/
├── lib/
│   ├── supabase-server.ts
│   ├── supabase-client.ts
│   └── utils.ts
├── hooks/
├── types/
└── README.md
```

### 4. Supabase Functions
Edge functions in Supabase project.

```
supabase/
├── config.toml
├── seed.sql
├── migrations/
│   ├── 20240101000000_init.sql
│   ├── 20240101000001_users.sql
│   ├── 20240101000002_wallets.sql
│   └── ...
└── functions/
    ├── quiz-scoring/
    │   └── index.ts
    ├── wallet-operations/
    │   └── index.ts
    ├── payment-webhook/
    │   └── index.ts
    ├── duplicate-detection/
    │   └── index.ts
    ├── ai-analysis/
    │   └── index.ts
    ├── send-notification/
    │   └── index.ts
    └── _shared/
        ├── supabase.ts
        ├── openai.ts
        └── razorpay.ts
```

---

## Module Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────▶│ Supabase Auth│────▶│   Database   │
│   App    │◀────│   (GoTrue)   │◀────│   (users)    │
└──────────┘     └──────────────┘     └──────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Trigger:        │
              │  Create wallet   │
              │  Create streak   │
              └──────────────────┘
```

**Flow:**
1. User signs up via Supabase Auth (email/phone)
2. Auth creates entry in `auth.users`
3. Trigger creates profile in `public.users`
4. Trigger creates wallet and streak tracker
5. JWT token returned to client with user claims

### Quiz Engine

```
┌────────────────────────────────────────────────────────────────┐
│                        Quiz Lifecycle                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  SELECT_MODE → SELECT_SUBJECT → FETCH_QUESTIONS → START_QUIZ   │
│       │                                              │         │
│       ▼                                              ▼         │
│   ┌────────┐                               ┌────────────────┐  │
│   │ Normal │ 30s/question                  │ Timer Starts   │  │
│   │ Fast   │ 15s/question                  │ Questions Loop │  │
│   │ Rapid  │ 5s/question (Phase 2)         └───────┬────────┘  │
│   │Extended│ 60s/question (Phase 2)                │           │
│   └────────┘                                       ▼           │
│                                            ┌────────────────┐  │
│   ANSWER → NEXT_QUESTION → ... → COMPLETE  │ Submit Answer  │  │
│                                    │       │ (client-side)  │  │
│                                    ▼       └────────────────┘  │
│                           ┌────────────────┐                   │
│                           │ Edge Function: │                   │
│                           │ quiz-scoring   │                   │
│                           └───────┬────────┘                   │
│                                   ▼                            │
│                    ┌──────────────────────────────┐            │
│                    │ Calculate Score (server)     │            │
│                    │ - Verify answers             │            │
│                    │ - Apply time bonus           │            │
│                    │ - Credit coins               │            │
│                    │ - Update leaderboard         │            │
│                    └──────────────────────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

**Scoring Formula:**
```
base_score = correct_answers * 10
time_bonus = max(0, (time_limit - time_taken) / time_limit * 5)
final_score = base_score + time_bonus (per question)

coins_earned = floor(final_score / 10) * membership_multiplier
```

### Wallet System (Double-Entry Ledger)

```
┌─────────────────────────────────────────────────────── ──────────┐
│                    Wallet Operations                             │
├────────────────────────────────────────────────────── ───────────┤
│                                                                  │
│  Client Request                                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────── ───────┐   │
│  │              Edge Function: wallet-operations             │   │
│  │                                                           │   │
│  │  1. Validate request                                      │   │
│  │  2. Check balance (for debits)                            │   │
│  │  3. Check daily/monthly limits                            │   │
│  │  4. BEGIN TRANSACTION                                     │   │
│  │     - Record wallet_transaction (immutable)               │   │
│  │     - Update wallet balance                               │   │
│  │  5. COMMIT                                                │   │
│  │  6. Return new balance                                    │   │
│  └────────────────────────────────────────────────── ────────┘   │
│                                                                  │
│  Transaction Types:                                              │
│  ┌─────────────────┬─────────────────────────────────────────┐  │
│  │ CREDIT          │ DEBIT                                   │  │
│  ├─────────────────┼─────────────────────────────────────────┤  │
│  │ credit_reward   │ debit_purchase (materials)              │  │
│  │ credit_commission│ debit_transfer (future: P2P)           │  │
│  │ credit_purchase │ debit_admin (manual adjustment)         │  │
│  │ credit_refund   │ debit_expiry (coin expiration)          │  │
│  │ credit_admin    │                                         │  │
│  └─────────────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Audit Trail: Every operation creates immutable transaction      │
│               with balance_before and balance_after              │
└─────────────────────────────────────────────────────────────────┘
```

### Payment Flow (Razorpay)

```
┌─────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│ Client  │      │ Supabase│      │ Razorpay │      │ Database │
└────┬────┘      └────┬────┘      └────┬─────┘      └────┬─────┘
     │                │                │                 │
     │ 1. Create Order│                │                 │
     │───────────────▶│                │                 │
     │                │ 2. Create Order│                 │
     │                │───────────────▶│                 │
     │                │◀───────────────│                 │
     │◀───────────────│ order_id       │                 │
     │                │                │                 │
     │ 3. Open Razorpay Checkout       │                 │
     │────────────────────────────────▶│                 │
     │                                 │                 │
     │ 4. Payment Success              │                 │
     │◀────────────────────────────────│                 │
     │                                 │                 │
     │ 5. Verify Signature             │                 │
     │───────────────▶│                │                 │
     │                │ 6. Verify      │                 │
     │                │───────────────▶│                 │
     │                │◀───────────────│                 │
     │                │                │                 │
     │                │ 7. Activate membership/credit    │
     │                │────────────────────────────────▶ │
     │                │◀──────────────────────────────── │
     │◀───────────────│                │                 │
     │  Success       │                │                 │
     │                │                │                 │
     │                │ 8. Webhook (backup)              │
     │                │◀───────────────│                 │
     │                │                │                 │
```

### AI Analysis Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                     AI Analysis Flow                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trigger: User opens AI Insights / Daily (cron)                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Edge Function: ai-analysis                     │   │
│  │                                                          │   │
│  │  1. Check cache (ai_insights table)                      │   │
│  │     - If recent insight exists (< 24h), return cached    │   │
│  │                                                          │   │
│  │  2. Gather user data:                                    │   │
│  │     - Last 30 quiz attempts                              │   │
│  │     - Subject-wise accuracy                              │   │
│  │     - Wrong answer patterns                              │   │
│  │     - Study time distribution                            │   │
│  │                                                          │   │
│  │  3. Call OpenAI API:                                     │   │
│  │     - Model: gpt-4o-mini (cost-effective)                │   │
│  │     - System prompt: Educational assistant role          │   │
│  │     - User context: Performance data                     │   │
│  │     - Output: Structured JSON                            │   │
│  │                                                          │   │
│  │  4. Parse and validate response                          │   │
│  │                                                          │   │
│  │  5. Store in ai_insights table                           │   │
│  │                                                          │   │
│  │  6. Return to client                                     │   │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Output Types:                                                  │
│  • performance_analysis: Overall performance summary            │
│  • weak_areas: Topics needing improvement                       │
│  • recommendations: Suggested quizzes/materials                 │
│  • daily_tip: Daily study tip                                   │
│  • generated_notes: Summary notes for weak topics               │
│                                                                 │
│  Cost Control:                                                  │
│  • Cache results for 24 hours                                   │
│  • Rate limit: 5 requests/user/day                              │
│  • Use gpt-4o-mini for most operations                          │
│  • Batch process daily tips via cron                            │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Patterns

### Real-time Updates

```
┌──────────────────────────────────────────────────────────────┐
│              Supabase Realtime Subscriptions                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Mobile App subscribes to:                                    │
│  • notifications (INSERT for user_id)                         │
│  • wallets (UPDATE for user_id)                               │
│  • leaderboard_entries (UPDATE for scope)                     │
│                                                               │
│  Admin Panel subscribes to:                                   │
│  • questions (INSERT/UPDATE for status='pending')             │
│  • payment_transactions (INSERT)                              │
│                                                               │
│  Implementation:                                              │
│  ```typescript                                                │
│  supabase                                                     │
│    .channel('notifications')                                  │
│    .on('postgres_changes', {                                  │
│      event: 'INSERT',                                         │
│      schema: 'public',                                        │
│      table: 'notifications',                                  │
│      filter: `user_id=eq.${userId}`                           │
│    }, handleNotification)                                     │
│    .subscribe()                                               │
│  ```                                                          │
└──────────────────────────────────────────────────────────────┘
```

### Offline Handling (Mobile)

```
┌──────────────────────────────────────────────────────────────┐
│                  Offline Strategy                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Cached locally (AsyncStorage/MMKV):                          │
│  • User profile                                               │
│  • Wallet balance (display only)                              │
│  • Downloaded materials (file system)                         │
│  • Recent quiz questions (prefetched)                         │
│  • Settings/preferences                                       │
│                                                               │
│  NOT cached (requires network):                               │
│  • Quiz submissions (must be online)                          │
│  • Payments                                                   │
│  • Leaderboard (always fresh)                                 │
│  • AI insights                                                │
│                                                               │
│  Sync Strategy:                                               │
│  • Pull-to-refresh on key screens                             │
│  • Background sync when app comes to foreground               │
│  • Show stale data with "last updated" timestamp              │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Supabase Auth                                       │
│  • JWT tokens with 1-hour expiry                              │
│  • Refresh tokens for seamless renewal                        │
│  • Email verification required for sensitive ops              │
│                                                               │
│  Layer 2: Row Level Security (RLS)                            │
│  • All tables have RLS enabled                                │
│  • Policies check auth.uid() and user role                    │
│  • Service role bypasses RLS (edge functions only)            │
│                                                               │
│  Layer 3: Edge Function Validation                            │
│  • Verify JWT in every function                               │
│  • Validate request payload with Zod                          │
│  • Rate limiting per user                                     │
│                                                               │
│  Layer 4: Admin Authorization                                 │
│  • Admin role stored in users.role                            │
│  • Custom claim added to JWT for fast checks                  │
│  • Admin actions logged to admin_action_logs                  │
│                                                               │
│  Payment Security:                                            │
│  • Razorpay signature verification                            │
│  • Webhook IP whitelist (Razorpay IPs)                        │
│  • Idempotency keys prevent duplicate processing              │
└──────────────────────────────────────────────────────────────┘
```

### Fraud Prevention

```
┌──────────────────────────────────────────────────────────────┐
│                  Fraud Detection Points                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Quiz Cheating:                                               │
│  • Server-side scoring only                                   │
│  • Answers not exposed in API until quiz complete             │
│  • Time validation (can't answer faster than question load)   │
│  • Pattern detection: consistent perfect scores flagged       │
│                                                               │
│  Wallet Abuse:                                                │
│  • Daily/monthly earning limits                               │
│  • Velocity checks (too many transactions too fast)           │
│  • Self-referral detection (same device fingerprint)          │
│  • Admin alerts for unusual patterns                          │
│                                                               │
│  Question Spam:                                               │
│  • Duplicate detection before approval                        │
│  • Rate limit: max 10 questions/user/day                      │
│  • Quality score based on user history                        │
│                                                               │
│  Account Abuse:                                               │
│  • Multi-account detection (device ID, IP patterns)           │
│  • Membership sharing detection (concurrent sessions)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Environments

```
┌─────────────────────────────────────────────────────────────┐
│                     Environments                            │
├─────────────────┬───────────────────┬───────────────────────┤
│   Development   │     Staging       │     Production        │
├─────────────────┼───────────────────┼───────────────────────┤
│ Local Supabase  │ Supabase Project  │ Supabase Project      │
│ (supabase start)│ (gyanpath-staging)│ (gyanpath-prod)       │
├─────────────────┼───────────────────┼───────────────────────┤
│ Expo Go         │ Internal build    │ App Store / Play Store│
│                 │ (TestFlight/APK)  │                       │
├─────────────────┼───────────────────┼───────────────────────┤
│ localhost:3000  │ admin-staging.    │ admin.gyanpath.in     │
│                 │ vercel.app        │                       │
├─────────────────┼───────────────────┼───────────────────────┤
│ Razorpay Test   │ Razorpay Test     │ Razorpay Live         │
├─────────────────┼───────────────────┼───────────────────────┤
│ OpenAI Dev Key  │ OpenAI Dev Key    │ OpenAI Prod Key       │
└─────────────────┴───────────────────┴───────────────────────┘
```

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On Push to main:                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Lint & Type Check                                   │ │
│  │ 2. Run Unit Tests                                      │ │
│  │ 3. Build Check                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  On Tag (v*):                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ gyanpath-mobile:                                       │ │
│  │   - EAS Build (iOS + Android)                          │ │
│  │   - Submit to TestFlight / Play Console                │ │
│  │                                                        │ │
│  │ gyanpath-admin:                                        │ │
│  │   - Deploy to Vercel (auto via Vercel GitHub app)      │ │
│  │                                                        │ │
│  │ Supabase:                                              │ │
│  │   - Run migrations (supabase db push)                  │ │
│  │   - Deploy functions (supabase functions deploy)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Decisions

| Decision          | Choice                    | Rationale |
|----------         |--------                   |-----------|
| Mobile Framework  | Expo + React Native       | Fast development, OTA updates, single codebase |
| Admin Framework   | Next.js 14                | Server components, fast builds, Vercel deployment |
| Backend           | Supabase                  | Auth + DB + Storage + Functions in one platform |
| Database          | PostgreSQL (via Supabase) | Robust, RLS support, full SQL |
| State Management  | Zustand + React Query     | Simple, performant, good caching |
| Styling (Mobile)  | NativeWind (Tailwind)     | Consistent with web, fast styling |
| Styling (Admin)   | shadcn/ui + Tailwind      | Beautiful defaults, customizable |
| Payments          | Razorpay                  | India-first, good React Native SDK |
| AI                | OpenAI API                | Best quality, structured outputs |
| Analytics         | PostHog                   | Self-hostable option, feature flags |
| Push Notifications | Expo Notifications       | Integrated with Expo ecosystem |

---

## Scaling Considerations

### Phase 1 (MVP)
- Single Supabase project
- Edge functions for compute
- Basic caching via table timestamps

### Phase 2 (Growth)
- Supabase connection pooling (PgBouncer)
- Redis cache for hot data (leaderboards)
- CDN for static assets

### Phase 3 (Scale)
- Read replicas for analytics queries
- Dedicated compute for AI workloads
- Microservice extraction if needed
