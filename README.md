# Gyan Path

A gamified edtech platform with mobile app, web admin panel, and AI-powered learning features.

## 🚀 Project Structure

```
gyanpath/
├── gyanpath-mobile/     # Expo React Native mobile app
├── gyanpath-admin/      # Next.js admin dashboard
├── gyanpath-shared/     # Shared types, utilities, validators
└── docs/                # Documentation
    ├── DATABASE_SCHEMA.md
    ├── ARCHITECTURE.md
    └── API_DOCS.md
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | Expo + React Native + TypeScript |
| Admin Panel | Next.js 15 + TypeScript + Tailwind |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Payments | Razorpay |
| AI | OpenAI API |
| State | Zustand + React Query |

## 📱 Features

### MVP (Phase 1)
- ✅ User authentication & profile
- ✅ Membership system with plans
- ⬜ Quiz modes: Normal & Fast
- ⬜ Daily questions
- ⬜ Leaderboards
- ⬜ Wallet & coins
- ⬜ Educational materials shop
- ⬜ AI performance insights
- ⬜ Push notifications
- ✅ Admin dashboard
- ✅ Question moderation

### Phase 2
- ⬜ Rapid Fire & Extended quiz modes
- ⬜ Multiplayer quiz rooms
- ⬜ Community groups
- ⬜ Video content
- ⬜ Cashout system

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Razorpay account (for payments)

### 1. Set up Supabase

1. Create a new Supabase project
2. Run the database migrations from `docs/DATABASE_SCHEMA.md`
3. Enable Row Level Security on all tables
4. Configure auth providers (email/password)

### 2. Set up Shared Package

```bash
cd gyanpath-shared
npm install
npm run build
```

### 3. Set up Mobile App

```bash
cd gyanpath-mobile
npm install
cp .env.example .env
# Fill in your Supabase credentials
npm start
```

### 4. Set up Admin Panel

```bash
cd gyanpath-admin
npm install
cp .env.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## 📚 Documentation

- [Database Schema](docs/DATABASE_SCHEMA.md) - Complete PostgreSQL schema
- [Architecture](docs/ARCHITECTURE.md) - System design and patterns
- [API Documentation](docs/API_DOCS.md) - Supabase API reference

## 🔐 Environment Variables

### Mobile App (.env)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RAZORPAY_KEY_ID=
```

### Admin Panel (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 🧪 Testing

```bash
# Mobile
cd gyanpath-mobile && npm test

# Admin
cd gyanpath-admin && npm test
```

## 🚢 Deployment

### Mobile App
- Use EAS Build for iOS and Android
- Configure `eas.json` with your credentials

### Admin Panel
- Deploy to Vercel
- Add environment variables in Vercel dashboard

### Supabase
- Use Supabase CLI for migrations
- Configure production project

## 📝 License

Private - All rights reserved

## 🤝 Contributing

Internal team only. Follow the coding standards in each project's README.
