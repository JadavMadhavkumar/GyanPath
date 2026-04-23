# Gyan Path Admin Panel

Next.js admin dashboard for the Gyan Path edtech platform.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **Backend:** Supabase (via SSR client)
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── layout.tsx           # Root layout
├── page.tsx            # Redirect to login
├── globals.css         # Global styles
├── login/              # Login page
└── (dashboard)/        # Protected dashboard routes
    ├── layout.tsx      # Dashboard shell with sidebar
    ├── page.tsx        # Overview dashboard
    ├── users/          # User management
    ├── questions/      # Question moderation
    ├── transactions/   # Payment transactions
    ├── wallets/        # Wallet management
    └── analytics/      # Analytics & reports

lib/
├── supabase-client.ts  # Browser Supabase client
├── supabase-server.ts  # Server Supabase client
└── utils.ts            # Helper functions

components/
├── ui/                 # Base UI components
└── dashboard/          # Dashboard-specific components
```

## Features

### Implemented
- [x] Admin authentication
- [x] Dashboard overview with stats
- [x] User list view
- [x] Question moderation queue

### Coming Soon
- [ ] User detail & edit
- [ ] Wallet adjustments
- [ ] Transaction reports
- [ ] Analytics charts
- [ ] Notification sending
- [ ] Settings management

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Security Notes

- Only users with `role = 'admin'` can access
- Service role key must never be exposed to client
- All admin actions should be logged to `admin_action_logs`
