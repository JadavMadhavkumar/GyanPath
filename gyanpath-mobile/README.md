# Gyan Path Mobile App

React Native mobile app built with Expo for the Gyan Path edtech platform.

## Tech Stack

- **Framework:** Expo SDK 54 with React Native
- **Routing:** Expo Router (file-based)
- **State:** Zustand + React Query
- **Backend:** Supabase (Auth, Database, Storage)
- **Payments:** Razorpay

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for development)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase and Razorpay credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

3. **Start development:**
   ```bash
   npm start
   ```

4. **Run on device:**
   - Scan QR code with Expo Go (Android)
   - Scan QR code with Camera (iOS)

## Project Structure

```
app/                    # Expo Router screens
├── (auth)/            # Auth screens (login, register)
├── (tabs)/            # Main tab navigation
├── quiz/              # Quiz flow screens
└── _layout.tsx        # Root layout

src/
├── components/        # Reusable components
├── hooks/            # Custom React hooks
├── services/         # API services (Supabase client)
├── stores/           # Zustand state stores
├── theme/            # Colors, typography
└── utils/            # Helper functions
```

## Available Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in browser
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript check

## Building for Production

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Local Build

```bash
# Android APK
expo build:android -t apk

# iOS (requires Mac)
expo build:ios
```

## Features

### MVP (Phase 1)
- [x] User authentication
- [x] Profile management
- [ ] Normal & Fast quiz modes
- [ ] Daily questions
- [ ] Leaderboards
- [ ] Wallet & coins
- [ ] Material purchase
- [ ] AI insights
- [ ] Push notifications

### Phase 2
- [ ] Rapid Fire & Extended modes
- [ ] Multiplayer
- [ ] Community groups
- [ ] Cashout

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key ID |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog analytics key (optional) |
