# Gyan Path Backend API

Complete backend API for Gyan Path - a multilingual edtech platform with quiz-based learning, AI-guided skill improvement, digital study resources, wallet and coin rewards, memberships, multiplayer competition, community groups, and career enablement.

## 🚀 Features

- **Authentication & User Management** - Supabase Auth with profile management
- **Quiz System** - Multiple modes (normal, fast, rapid-fire, extended, daily), scoring, leaderboards
- **Wallet & Coins** - Double-entry ledger system with rewards and redemptions
- **Memberships** - Tiered plans (Basic, Premium, Pro) with Razorpay integration
- **Question Management** - User contributions with admin approval workflow
- **AI Insights** - Performance analysis, weak area detection, study plans, daily tips
- **Educational Materials** - Marketplace for notes, PDFs, video bundles
- **Notifications** - Push notifications, reminders, alerts
- **Community** - Groups, messaging, moderation
- **Admin Dashboard** - User management, content approval, fraud detection, reports

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL (via Supabase)
- Redis (for caching and rate limiting)
- Supabase project
- Razorpay account (for payments)
- OpenAI API key (for AI features)

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
cd gyanpath-backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Redis
REDIS_URL=redis://localhost:6379
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
gyanpath-backend/
├── src/
│   ├── config/              # Configuration
│   │   └── index.ts
│   ├── db/                  # Database migrations and seeds
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── lib/                 # External service clients
│   │   ├── supabase.ts
│   │   ├── razorpay.ts
│   │   ├── openai.ts
│   │   └── redis.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── quiz.ts
│   │   ├── wallet.ts
│   │   ├── membership.ts
│   │   ├── ai.ts
│   │   ├── materials.ts
│   │   ├── notifications.ts
│   │   ├── community.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── walletService.ts
│   │   ├── quizService.ts
│   │   ├── membershipService.ts
│   │   ├── aiService.ts
│   │   ├── materialService.ts
│   │   ├── notificationService.ts
│   │   ├── communityService.ts
│   │   └── adminService.ts
│   ├── types/               # TypeScript types
│   │   ├── user.ts
│   │   ├── wallet.ts
│   │   ├── membership.ts
│   │   ├── quiz.ts
│   │   ├── material.ts
│   │   ├── notification.ts
│   │   ├── ai.ts
│   │   ├── payment.ts
│   │   ├── community.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── response.ts
│   │   ├── errors.ts
│   │   └── logger.ts
│   ├── validators/          # Zod schemas
│   │   ├── user.ts
│   │   ├── quiz.ts
│   │   ├── wallet.ts
│   │   ├── membership.ts
│   │   ├── ai.ts
│   │   ├── material.ts
│   │   ├── community.ts
│   │   └── index.ts
│   └── server.ts            # Express app entry point
├── migrations/              # SQL migrations
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

Obtain the token by:
1. Registering via `/api/v1/auth/register`
2. Logging in via Supabase Auth client

## 📚 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication & Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/logout` | Logout user | Required |
| GET | `/auth/me` | Get current profile | Required |
| PUT | `/auth/profile` | Update profile | Required |
| POST | `/auth/change-password` | Change password | Required |
| GET | `/auth/membership` | Get membership status | Required |
| GET | `/auth/users` | Search users | Admin |
| PUT | `/auth/users/:userId/status` | Block/unblock user | Admin |
| POST | `/auth/users/:userId/reset-password` | Reset password | Admin |

### Quiz System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quiz/subjects` | Get all subjects | Public |
| GET | `/quiz/questions` | Get approved questions | Public |
| POST | `/quiz/questions` | Create question | Required |
| PUT | `/quiz/questions/:questionId` | Update question | Owner |
| GET | `/quiz/questions/pending` | Get pending questions | Admin |
| POST | `/quiz/questions/:questionId/approve` | Approve/reject | Admin |
| POST | `/quiz/create` | Create quiz | Required |
| GET | `/quiz/:quizId` | Get quiz details | Public |
| POST | `/quiz/:quizId/start` | Start attempt | Required |
| POST | `/quiz/attempt/:attemptId/answer` | Submit answer | Required |
| POST | `/quiz/attempt/:attemptId/complete` | Complete quiz | Required |
| GET | `/quiz/leaderboard` | Get leaderboard | Public |
| GET | `/quiz/daily` | Get daily question | Public |
| GET | `/quiz/my-attempts` | Get user attempts | Required |
| GET | `/quiz/my-questions` | Get user questions | Required |

### Wallet

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/wallet/balance` | Get balance | Required |
| GET | `/wallet/transactions` | Transaction history | Required |
| POST | `/wallet/operation` | Perform operation | Required |
| POST | `/wallet/redeem` | Redeem coins | Required |
| POST | `/wallet/admin/adjust` | Admin adjust | Admin |
| GET | `/wallet/admin/stats` | Wallet statistics | Admin |

### Membership & Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/membership/plans` | Get plans | Public |
| GET | `/membership/my-membership` | Get membership | Required |
| POST | `/membership/order` | Create order | Required |
| POST | `/membership/verify-payment` | Verify payment | Required |
| POST | `/membership/webhook` | Razorpay webhook | Public |
| GET | `/membership/transactions` | User transactions | Required |
| GET | `/membership/admin/transactions` | All transactions | Admin |
| GET | `/membership/admin/revenue-report` | Revenue report | Admin |

### AI Insights

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/analyze` | Get AI analysis | Required |
| GET | `/ai/insights` | Get user insights | Required |
| POST | `/ai/daily-tip` | Get daily tip | Required |
| POST | `/ai/study-plan` | Generate study plan | Required |

### Materials

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/materials` | List materials | Public |
| GET | `/materials/:materialId` | Get details | Public |
| POST | `/materials` | Create material | Admin |
| GET | `/materials/:materialId/purchase-status` | Check purchase | Required |
| POST | `/materials/:materialId/purchase` | Purchase | Required |
| GET | `/materials/my-purchases` | User purchases | Required |
| GET | `/materials/:materialId/download` | Download URL | Required |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get notifications | Required |
| PUT | `/notifications/:notificationId/read` | Mark as read | Required |
| PUT | `/notifications/read-all` | Mark all read | Required |
| POST | `/notifications/broadcast` | Broadcast | Admin |

### Community

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/community/groups` | User's groups | Required |
| POST | `/community/groups` | Create group | Required |
| GET | `/community/groups/:groupId` | Group details | Public |
| GET | `/community/groups/:groupId/members` | Group members | Public |
| POST | `/community/groups/:groupId/join` | Join group | Required |
| POST | `/community/groups/:groupId/leave` | Leave group | Required |
| POST | `/community/groups/:groupId/invite` | Invite user | Required |
| GET | `/community/groups/:groupId/messages` | Get messages | Required |
| POST | `/community/groups/:groupId/messages` | Send message | Required |
| DELETE | `/community/groups/:groupId` | Delete group | Owner/Admin |
| GET | `/community/admin/groups` | All groups | Admin |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/dashboard` | Dashboard stats | Admin |
| GET | `/admin/logs` | Admin action logs | Admin |
| GET | `/admin/fraud-report` | Fraud detection | Admin |
| PUT | `/admin/settings` | Update settings | Admin |
| GET | `/admin/system-logs` | System logs | Admin |

## 📝 Request/Response Examples

### Register User

**Request:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword123",
  "full_name": "Rahul Kumar",
  "class": "12th",
  "subjects": ["mathematics", "physics"],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "full_name": "Rahul Kumar",
      "role": "student",
      "class": "12th",
      "subjects": ["mathematics", "physics"],
      "language": "en"
    },
    "message": "Registration successful"
  }
}
```

### Start Quiz

**Request:**
```bash
POST /api/v1/quiz/quiz-id-here/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attempt-uuid",
    "user_id": "user-uuid",
    "quiz_id": "quiz-uuid",
    "status": "in_progress",
    "started_at": "2024-01-15T10:00:00Z",
    "total_questions": 10
  }
}
```

### Complete Quiz

**Request:**
```bash
POST /api/v1/quiz/attempt/attempt-id-here/complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_questions": 10,
    "correct_answers": 7,
    "wrong_answers": 2,
    "skipped": 1,
    "score": 85,
    "time_taken_seconds": 180,
    "coins_earned": 35,
    "answers": [...]
  }
}
```

### Purchase Membership

**Request:**
```bash
POST /api/v1/membership/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": "plan-uuid",
  "auto_renew": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_xxxxx",
    "amount": 10098,
    "currency": "INR",
    "key_id": "rzp_test_xxxxx",
    "transaction_id": "txn-uuid"
  }
}
```

## 🎯 Scoring Formula

```typescript
base_score = correct_answers * 10
time_bonus = max(0, (time_limit - time_taken) / time_limit * 5)
final_score = base_score + time_bonus (per question)

coins_earned = floor(final_score / 10) * membership_multiplier
```

## 💰 Wallet Transaction Types

| Type | Description |
|------|-------------|
| `credit_reward` | Quiz completion, achievements |
| `credit_commission` | Question usage commission |
| `credit_purchase` | Bought coins |
| `credit_refund` | Refunded coins |
| `credit_admin` | Admin adjustment |
| `debit_purchase` | Spent on materials |
| `debit_transfer` | P2P transfer (future) |
| `debit_admin` | Admin adjustment |
| `debit_expiry` | Coin expiration |

## 🔒 Security

- **JWT Authentication** via Supabase Auth
- **Row Level Security (RLS)** on all database tables
- **Rate Limiting** per user and endpoint
- **Input Validation** using Zod schemas
- **Helmet.js** for HTTP security headers
- **CORS** configuration for allowed origins
- **Admin Action Logging** for audit trail

## 📊 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth (signup/login) | 10/15min |
| AI Analysis | 5/user/day |
| Question Submission | 10/user/day |
| Quiz Completion | 50/user/day |
| Wallet Operations | 100/user/day |
| General API | 100/15min |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 🚢 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `NODE_ENV=production`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `OPENAI_API_KEY`
- `REDIS_URL`

## 📖 Database Schema

The database includes tables for:
- Users (extends Supabase auth.users)
- Membership plans & user memberships
- Wallets & transactions (double-entry ledger)
- Subjects, questions, quizzes, attempts
- Leaderboard entries
- Materials & purchases
- Notifications
- AI insights
- Payment transactions
- Admin action logs
- Groups, members, messages, invites
- User streaks

Run `npm run migrate` to apply all migrations.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check API documentation at `/api/v1/health`
- Review error logs in `logs/` directory

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication
- ✅ Quiz system
- ✅ Wallet & coins
- ✅ Memberships
- ✅ AI insights
- ✅ Materials marketplace
- ✅ Community groups
- ✅ Admin dashboard

### Phase 2
- [ ] Battle quiz (multiplayer rooms)
- [ ] Referral system
- [ ] Scholarship logic
- [ ] Admission discovery
- [ ] Career module
- [ ] PG/Hostel finder

### Phase 3
- [ ] Voice AI assistant
- [ ] English speaking practice
- [ ] Resume builder
- [ ] Advanced fraud detection
- [ ] Push notifications (Expo)
- [ ] Real-time WebSocket updates
