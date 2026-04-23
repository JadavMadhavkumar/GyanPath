# @gyanpath/shared

Shared types, utilities, and Supabase client configuration for Gyan Path mobile and admin apps.

## Installation

This is a local package linked via npm workspaces or direct file path.

```bash
# In gyanpath-mobile or gyanpath-admin
npm install ../gyanpath-shared
```

## Usage

### Types

```typescript
import type { User, Quiz, Wallet, MembershipPlan } from '@gyanpath/shared';
```

### Supabase Client

```typescript
import { supabase } from '@gyanpath/shared';

// Or create custom client (e.g., for React Native with AsyncStorage)
import { createSupabaseClient } from '@gyanpath/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createSupabaseClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { storage: AsyncStorage }
);
```

### Constants

```typescript
import { APP_CONFIG, FEATURES, ROLES, hasPermission } from '@gyanpath/shared';

if (FEATURES.aiInsights) {
  // Show AI features
}

if (hasPermission(user.role, 'view_admin_panel')) {
  // Show admin link
}
```

### Validators

```typescript
import { registerSchema, createQuestionSchema } from '@gyanpath/shared';

// Validate form input
const result = registerSchema.safeParse(formData);
if (!result.success) {
  console.log(result.error.issues);
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run type-check
```

## Structure

```
src/
├── types/          # TypeScript interfaces and types
├── lib/            # Supabase client and API helpers
├── constants/      # App config, feature flags, roles
├── validators/     # Zod validation schemas
└── index.ts        # Main export
```
