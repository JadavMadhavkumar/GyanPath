<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Gyan Path mobile app (Expo / React Native). Here is a summary of every change made:

- **`app.config.js`** (new): Converts the project from static `app.json` to a dynamic Expo config that injects `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` into `Constants.expoConfig.extra`.
- **`src/config/posthog.ts`** (new): Creates and exports the PostHog client instance using `expo-constants` to read keys from app config. Disables analytics gracefully when the token is not set.
- **`app/_layout.tsx`**: Wraps the entire app in `PostHogProvider`, enables touch autocapture, and adds manual screen tracking via `posthog.screen()` on every pathname change using `usePathname` and `useGlobalSearchParams`.
- **`app/(auth)/login.tsx`**: Calls `posthog.identify()` and captures `user_signed_in` on successful login. Captures `$exception` on error.
- **`app/(auth)/register.tsx`**: Calls `posthog.identify()` and captures `user_signed_up` on successful registration. Captures `$exception` on error.
- **`app/(tabs)/quiz.tsx`**: Captures `quiz_mode_selected` (with `mode` and `mode_title` properties) when an available quiz mode card is tapped.
- **`app/quiz/[mode].tsx`**: Captures `quiz_started` (with quiz ID, attempt ID, mode, subject name, question count, and time per question) after a quiz attempt is successfully created. Captures `$exception` on error.
- **`app/quiz/play/[id].tsx`**: Captures `quiz_answer_submitted` (with question number, selected option, and `is_correct`) on each answer. Captures `quiz_completed` (with score, correct/wrong counts, coins and XP earned) on submission. Captures `$exception` on error.
- **`app/quiz/results/[id].tsx`**: Captures `quiz_results_viewed` (with score, percentage, grade stats, rewards, mode, and subject) when results are fetched.
- **`app/(tabs)/wallet.tsx`**: Captures `wallet_buy_coins_tapped` and `wallet_membership_tapped` on the respective action buttons.
- **`app/(tabs)/profile.tsx`**: Captures `user_signed_out` and calls `posthog.reset()` before sign-out to clear the identity.
- **`app/ai/insights.tsx`**: Captures `ai_insight_generated` after a successful AI insight generation. Captures `$exception` on error.
- **`.env`**: Created with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (covered by `.gitignore`).

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signed in | `app/(auth)/login.tsx` |
| `user_signed_up` | User successfully registered | `app/(auth)/register.tsx` |
| `quiz_mode_selected` | User tapped a quiz mode card | `app/(tabs)/quiz.tsx` |
| `quiz_started` | Quiz attempt created and started | `app/quiz/[mode].tsx` |
| `quiz_answer_submitted` | User selected an answer for a question | `app/quiz/play/[id].tsx` |
| `quiz_completed` | Quiz submitted and scored | `app/quiz/play/[id].tsx` |
| `quiz_results_viewed` | User viewed quiz results screen | `app/quiz/results/[id].tsx` |
| `ai_insight_generated` | AI insight generated successfully | `app/ai/insights.tsx` |
| `wallet_buy_coins_tapped` | User tapped Buy Coins button | `app/(tabs)/wallet.tsx` |
| `wallet_membership_tapped` | User tapped Membership button | `app/(tabs)/wallet.tsx` |
| `user_signed_out` | User confirmed sign out | `app/(tabs)/profile.tsx` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior, based on the events just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/380908/dashboard/1463127
- **Quiz Completion Funnel** (`quiz_started` → `quiz_completed` → `quiz_results_viewed`): https://us.posthog.com/project/380908/insights/H51gMD1q
- **New Users vs Returning Sign-ins** (daily DAU for sign-ups and sign-ins): https://us.posthog.com/project/380908/insights/fluDu54U
- **Quiz Mode Popularity** (breakdown of `quiz_mode_selected` by mode): https://us.posthog.com/project/380908/insights/NiEmcIOQ
- **New User Activation Funnel** (`user_signed_up` → `quiz_started` → `quiz_completed` within 7 days): https://us.posthog.com/project/380908/insights/OOrOcY4I
- **Monetization Interest (Wallet Actions)** (`wallet_buy_coins_tapped` and `wallet_membership_tapped` over time): https://us.posthog.com/project/380908/insights/3XofqaDR

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
