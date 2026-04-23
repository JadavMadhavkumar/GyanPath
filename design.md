# Gyan Path UI/UX Design System & Screen Specification

**Editorial Intelligence — Living Canvas Design Philosophy**

---

**Version 1.0 | April 2026 | Confidential**

---

## Document Scope

This document defines the complete UI/UX specification for the Gyan Path student platform. It covers: design philosophy, color tokens, typography, components, all 8 screens, and developer handoff guidelines.

---

## Quick Reference

| Section | Page |
|---------|------|
| 1. Design Philosophy & North Star | 2 |
| 2. Color System & Tokens | 3 |
| 3. Typography System | 4 |
| 4. Elevation, Shadow & Surface Rules | 5 |
| 5. Component Library | 6 |
| 6. Screen 1 — Onboarding / Language Selection | 8 |
| 7. Screen 2 — Home Dashboard | 9 |
| 8. Screen 3 — Quiz Screen | 11 |
| 9. Screen 4 — AI Assistant | 13 |
| 10. Screen 5 — Battle Arena | 15 |
| 11. Screen 6 — Digital Library | 16 |
| 12. Screen 7 — Wallet | 18 |
| 13. Screen 8 — Home Dashboard (Dark Variant) | 19 |
| 14. Navigation System | 20 |
| 15. Do's and Don'ts | 21 |
| 16. Developer Handoff | 22 |

---

## 1. Design Philosophy & Creative North Star

### 1.1 Editorial Intelligence

Gyan Path's design language is called "Editorial Intelligence." It treats the interface like a premium interactive textbook — clean, authoritative, and spacious. Every pixel choice is intentional. The platform must feel like high-end stationery brought to life through digital light, not like a generic educational portal.

**The Creative North Star: Living Canvas**

We break the "template" look through intentional asymmetry: large bold typographic headers paired with off-center floating elements and overlapping surfaces that suggest depth and motion.

The result should feel editorial — something between a premium magazine and a fintech app — while remaining warm and student-friendly.

### 1.2 Core Design Principles

| Principle | Description |
|-----------|-------------|
| **No-Line Rule** | Never use 1px solid borders to divide content. Use background shifts, tonal transitions, and whitespace instead. |
| **Tonal Depth** | Depth is created by stacking surfaces: surface-container-lowest on surface-container-low creates lift without shadows. |
| **Ambient Softness** | Shadows use tinted colors (never pure black). Box-shadow: 0 12px 32px rgba(13,28,46,0.06). |
| **Friendly Roundness** | No hard 90-degree corners anywhere. xl (1.5rem) and lg (1rem) border-radius throughout. |
| **Generous Whitespace** | 32px+ between major content blocks. Content breathes — never cramped. |
| **Glass & Gradient** | Hero sections use linear gradients. Nav bars and floating elements use glassmorphism (80% opacity + 20px blur). |

### 1.3 Dual Theme Support

Gyan Path supports both Light Mode and Dark Mode. Light mode uses the surface architecture described below. Dark mode (seen in Battle Arena, Library, and Home Dark) uses a deep navy/charcoal (#0d1117) base with elevated card surfaces (#161b22) and reduced opacity accent colours. Both modes share identical component shapes and spacing — only surface colors and text colors change.

---

## 2. Color System & Design Tokens

### 2.1 Primary Palette

All colours are defined as design tokens. Developers must reference tokens — never hardcode hex values in components.

| Color | Hex | Token | Usage |
|-------|-----|-------|-------|
| Primary | #24389c | primary | Navigation, CTA buttons, structural anchors, headings |
| Primary Cont. | #3f51b5 | primary_container | Gradient endpoint for hero sections and primary buttons |
| Secondary | #8b5000 | secondary | Coin icons, reward system, energy indicators |
| Sec. Container | #ff9800 | secondary_container | Claim Reward / Start Quiz button fills |
| Tertiary | #004e33 | tertiary | Progress bars (fill), success states, growth indicators |
| Tertiary Fixed | #6ffbbe | tertiary_fixed | Progress bar background track |
| On Sec. Cont. | #653900 | on_secondary_container | Text on secondary container backgrounds |

### 2.2 Surface Architecture

Surfaces are stacked like semi-translucent sheets. The hierarchy below defines depth — place lower numbers on top of higher numbers to create lift.

| Color | Hex | Token | Usage |
|-------|-----|-------|-------|
| Surface | #f8f9ff | surface | Base page background for all light mode screens |
| Surf. Low | #eef1fb | surface_container_low | Card backgrounds, section separators |
| Surf. High | #dce9ff | surface_container_high | Interactive sidebars, floating drawers |
| Surf. Lowest | #ffffff | surface_container_lowest | Main content cards, quiz question container |
| On Surface | #0d1c2e | on_surface | Primary body text (never use pure black #000000) |
| On Surf. Var. | #454652 | on_surface_variant | Secondary text, captions, timestamps |
| Outline Variant | #c5c5d4 | outline_variant | Ghost borders at 15% opacity when accessibility requires |

### 2.3 Dark Mode Surface Tokens

| Color | Hex | Token | Usage |
|-------|-----|-------|-------|
| Dark Base | #0d1117 | dark_surface | Full screen background in dark mode |
| Dark Card | #161b22 | dark_surface_low | Card and container backgrounds in dark mode |
| Dark Raised | #1f2937 | dark_surface_high | Elevated elements (modals, drawers) in dark mode |
| Dark Text | #e6edf3 | dark_on_surface | Primary text in dark mode |
| Dark Muted | #8b949e | dark_on_surface_variant | Secondary / caption text in dark mode |

---

## 3. Typography System

### 3.1 Font Stack

**Dual-Font Strategy**

- **Display & Headlines:** Plus Jakarta Sans — the editorial voice. Use for welcome screens, module titles, numeric values (fintech-lite feel).
- **Body & Labels:** Inter — the utility voice. Maximum legibility during long reading sessions.
- **Fallback stack:** system-ui, -apple-system, Arial, sans-serif

### 3.2 Type Scale

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| display-lg | Plus Jakarta | 3rem / 48px | 700 | Welcome / splash screens |
| display-md | Plus Jakarta | 2.25rem / 36px | 700 | Hero section titles |
| display-sm | Plus Jakarta | 1.875rem / 30px | 700 | Wallet balance figure |
| headline-lg | Plus Jakarta | 1.5rem / 24px | 700 | Module and page titles |
| headline-md | Plus Jakarta | 1.25rem / 20px | 600 | Card headings, quiz question |
| title-sm | Inter | 0.875rem / 14px | 500 | Subtitles, hook-and-detail rhythm |
| body-md | Inter | 0.875rem / 14px | 400 | All educational body content |
| body-sm | Inter | 0.75rem / 12px | 400 | Captions, timestamps, meta |
| label-lg | Inter | 0.875rem / 14px | 500 | Button text, tab labels |
| label-sm | Inter | 0.75rem / 12px | 500 | Tags, badges, pill labels |

### 3.3 Typographic Rules

- Headlines use letter-spacing: -0.02em for bespoke high-end feel
- Always lead with headline-lg followed by title-sm in on_surface_variant — the hook-and-detail rhythm
- Use Plus Jakarta Sans for ALL numeric values (coin balances, scores, ranks, percentages)
- Never use pure black (#000000) for text — always use on_surface (#0d1c2e)
- Line height: 1.4 for headlines, 1.6 for body, 1.5 for labels

---

## 4. Elevation, Depth & Shadow System

### 4.1 The Layering Principle

Traditional box-shadows are "dirty" — they break the premium feel. Gyan Path uses Ambient Softness: depth through surface stacking rather than explicit shadow values.

| Elevation Level | Surface Token | Background Token | Example Use |
|----------------|-------------|----------------|---------------|
| Level 0 (Base) | surface (#f8f9ff) | page background | Screen / page canvas |
| Level 1 (Raised) | surface_container_low | surface | Card sections, subject categories |
| Level 2 (Float) | surface_container_lowest | surface_container_low | Quiz question card, main content focus |
| Level 3 (Overlay) | surface_container_high | surface_container_low | AI chat sidebar, filter drawers |
| Level 4 (Modal) | surface_container_lowest + shadow | any level | Modals, bottom sheets, tooltips |

### 4.2 Shadow Specification

**Ambient Shadow (Level 4 only)**

```
box-shadow: 0 12px 32px rgba(13, 28, 46, 0.06)
```

- The shadow color is a tinted version of on-surface, never pure black.
- Use only for: floating AI bubbles, modal overlays, bottom drawer handles.

### 4.3 Ghost Border Fallback

When accessibility requires a visible boundary (e.g., WCAG 1.4.11 non-text contrast), use the Ghost Border: outline-variant (#c5c5d4) at 15% opacity. It must be felt, not seen — 0.5px width maximum.

### 4.4 Glassmorphism Spec

- Background color: surface (#f8f9ff) at 80% opacity
- Backdrop filter: blur(20px)
- Use for: mobile nav bar, floating AI chat bubble, wallet balance glass card
- Never apply glassmorphism to content-heavy cards — only decorative/floating elements

---

## 5. Component Library

### 5.1 Buttons

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Primary Button | Gradient fill: primary → primary_container at 135°, xl radius (1.5rem), height 52px | btn-primary | Use for main actions: Submit Answer, Get Started, Generate Report |
| Secondary Button | secondary_container (#ff9800) fill, on_secondary_container (#653900) text, xl radius | btn-secondary | Use for reward actions: Claim Reward, Start Quiz, Use Hint |
| Tertiary Button | No fill, primary (#24389c) text, xl radius, transparent background | btn-tertiary | Use for: Back, Skip, Cancel Matchmaking, Previous Question |
| Glass Button | surface at 80% opacity, blur(20px), outline-variant ghost border, lg radius | btn-glass | Floating actions on dark backgrounds (Battle Arena, Library dark) |

### 5.2 Cards

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Content Card | surface_container_lowest bg, lg radius (1rem), Level 2 elevation, 24px padding | card-content | Quiz question container, module description, library book card |
| Progress Card | surface_container_low bg, xl radius, left accent border in tertiary (#004e33) | card-progress | Daily streak, monthly progress, study tracker |
| Glass Wallet Card | primary (#24389c) at 70% opacity, blur(20px), xl radius, white text | card-wallet | Coin balance display in Wallet screen |
| Featured Hero Card | Gradient bg (primary to primary_container 135°), full width, xl radius, 32px padding | card-hero | Recommended content in Home dashboard |
| Action Icon Card | surface_container_low bg, lg radius, centered icon + label, 80px × 80px | card-action | Pathway grid: Daily Quiz, Library, Assistant, Wallet, Admissions, Jobs |

### 5.3 Quiz Answer Options

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Option (unselected) | surface_container_low bg, xl radius, 16px vertical padding, no border | option-default | Never use a divider line between options — use md vertical spacing |
| Option (hover) | surface_container bg (slightly darker), scale 1.01 transition 150ms | option-hover | Touch feedback on mobile — use onPress opacity change |
| Option (selected correct) | primary fill (#24389c), white text + check icon, xl radius | option-correct | Selected state with answer confirmed |
| Letter Badge | surface_container_high bg circle 36px, primary text for default / white for selected | option-badge | A, B, C, D labels on left of each option |

### 5.4 Progress Bar

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Track | tertiary_fixed (#6ffbbe), height 8px, xl radius, full width | progress-track | Background rail of all progress bars |
| Fill | tertiary (#004e33), height 8px, animated width transition 400ms ease | progress-fill | Active fill that grows as progress increases |
| Label (left) | on_surface_variant text, label-sm, uppercase, letter-spacing 0.08em | progress-label | e.g., '18 MODULES DONE' |
| Label (right) | on_surface_variant text, label-sm | progress-label-end | e.g., '6 REMAINING' |

### 5.5 Navigation Bar

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Nav Container | surface at 80% opacity, blur(20px), fixed bottom, 64px height, 0 shadow | nav-bar | Glassmorphism — the only nav treatment allowed |
| Active Tab | primary fill pill behind icon, icon in white, label in primary, label-sm bold | nav-active | Currently selected tab only |
| Inactive Tab | No fill, icon in on_surface_variant, label in on_surface_variant, label-sm | nav-inactive | All other tabs |
| Tab Icon | 24px × 24px, 2px stroke weight | nav-icon | Use outlined icons for inactive, filled for active |

### 5.6 AI Chat Bubbles

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| AI Bubble | surface_container_high (#dce9ff) bg, lg radius, bottom-left corner 0 (sharp) | bubble-ai | Creates organic asymmetric flow — never use symmetric rounded corners |
| User Bubble | primary (#24389c) bg, white text, lg radius, bottom-right corner 0 (sharp) | bubble-user | User messages always flush right |
| AI Avatar | 40px circle, primary bg, white robot icon, top-left aligned with bubble | avatar-ai | Floats beside AI bubbles — uses ambient shadow |
| Suggestion Chip | surface_container_high bg, primary text, label-sm, lg radius, 32px height | chip-suggest | Scrollable row of quick-reply suggestions below chat |

### 5.7 Coin & Wallet Elements

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Coin Icon | secondary (#8b5000) color, 24px circular badge, trophy or coin glyph | icon-coin | Used in header balance, reward notifications |
| Balance Display | display-sm (30px) Plus Jakarta Sans, white text on glass card | wallet-balance | The large number — uses numeric fintech font treatment |
| INR Conversion | surface_container_high pill, body-sm, on_surface_variant text | wallet-inr | Approximate INR value below coin balance |
| Transaction Row | Icon (40px, surface_container_low bg) + label + date + amount right-aligned | tx-row | No border between rows — use 16px vertical spacing only |
| + Amount | tertiary (#004e33) text, label-lg bold | tx-credit | Credit amounts (quiz win, referral, question approved) |
| - Amount | error red text, label-lg bold | tx-debit | Debit amounts (library access, battle entry) |

---

## 6. Screen 1 — Onboarding / Language Selection

### 6.1 Screen Purpose

The onboarding screen is the first impression. It must communicate premium quality and educational authority within seconds. Language selection happens here — critical for India's multilingual student base.

### 6.2 Layout Structure

1. Hero image: Library/bookshelf photograph with gradient overlay (primary to transparent, 135°). Rounded xl corners. Full width, ~45% viewport height.
2. Heading block: 'Namaste.' in display-md (Plus Jakarta), primary color. Subtext 'Select your preferred learning path to begin.' in body-md, on_surface_variant.
3. Language selector: CHOOSE LANGUAGE label in label-sm uppercase. Each language as a card (surface_container_lowest bg, xl radius, 64px height). Selected card gets primary border (2px) and primary check icon.
4. CTA: 'Get Started →' Primary gradient button, full width, xl radius, 52px height.
5. Step indicator: 3 dots below CTA. Active dot = primary, inactive = outline_variant. 'Step 1 of 3' in label-sm.
6. Reward nudge: secondary_container (#ff9800) icon + 'Start earning Gyan Coins' in secondary color. Motivational card with amber accent.

### 6.3 Detailed Specifications

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Hero image overlay | linear-gradient(135°, #24389c 0%, transparent 100%) | hero-gradient | Ensures text readability on photograph |
| GyanPath logo | White color on hero, primary on light bg, 24px height | logo | Appears top-left on hero card |
| Language option (selected) | 2px solid primary border, primary check icon right-aligned, headline text in primary | lang-selected | English — Standard Academic |
| Language option (default) | No border, ghost border fallback at 15%, body-md on_surface text | lang-default | Hindi, Bengali, Marathi options |
| Reward nudge card | secondary_container (#ff9800) 56px icon container, secondary text for headline | nudge-reward | 'Complete your profile to claim first 50 coins' |
| Footer legal text | body-sm, on_surface_variant, center aligned, 32px top margin | text-legal | 'By continuing, you agree to our Editorial Ethics & Learning Policy.' |

---

## 7. Screen 2 — Home Dashboard (Light Mode)

### 7.1 Screen Purpose

The Home Dashboard is the student control centre. It must surface the most relevant content immediately and provide fast access to all major modules. The design balances editorial hierarchy with utility navigation.

### 7.2 Header Bar

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Avatar | 40px circle, student photo or initials, top-left | avatar-user | Taps to open Profile |
| App name | headline-md 'GyanPath' or 'Gyan Path', on_surface bold | header-title | Center aligned |
| Coin balance | secondary container pill: coin icon + number in Plus Jakarta Sans label-lg | header-coins | Shows current Gyan Coin count |
| Notification bell | 24px icon, on_surface_variant, badge dot in secondary for unread | header-notif | Top right corner |

### 7.3 Welcome Block

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Greeting | display-md 'Namaste, [Name]', Plus Jakarta Sans, on_surface, letter-spacing -0.02em | greeting-headline | Personalised — pulls student name from profile |
| Subline | body-md, on_surface_variant, 8px top margin | greeting-sub | 'Your editorial journey through knowledge continues.' |

### 7.4 Recommended Hero Card

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Card bg | Gradient primary → primary_container 135°, xl radius, 180px height | hero-card | Full width, 16px horizontal margin |
| Label chip | 'RECOMMENDED' in surface_container_high bg, primary text, label-sm, lg radius | chip-rec | Top-left corner of card |
| Title | headline-lg white, Plus Jakarta, -0.02em letter-spacing, 2-3 lines | hero-title | Module name — truncate at 3 lines |
| CTA | 'Resume Learning' tertiary button — white fill, primary text, lg radius | hero-cta | Inside the hero card, bottom area |

### 7.5 Daily Streak Card

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Container | surface_container_lowest bg, xl radius, 24px padding, Level 2 elevation | streak-card | Left accent border in secondary (#8b5000) |
| Icon | 48px secondary_container bg circle, arrow-up icon in secondary | streak-icon | Top-left of card |
| Streak count | display-sm '12/15' right-aligned, secondary color, Plus Jakarta | streak-count | Current / goal format |
| Day indicators | 7 pill shapes, M T W T F S S — filled secondary for completed, outline for future | streak-days | Horizontal scrollable row of weekly day pills |
| Description | body-sm 'You are on a 12-day streak! Complete today's quiz to earn 50 Gyan Coins.' | streak-desc | on_surface_variant text |

### 7.6 Pathways Grid

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Section heading | headline-md 'Pathways', on_surface, 32px top margin | section-head | No divider line — use whitespace only |
| Grid layout | 2 columns, 8px gap, 3 rows = 6 items (Quiz, Library, Assistant, Wallet, Admissions, Jobs) | pathway-grid | Extends to show all 6 pathways |
| Pathway card | surface_container_low bg, xl radius, 80px × 80px, centered icon 24px + label body-sm below | card-pathway | Icon uses primary color, label uses on_surface |

### 7.7 Monthly Learning Progress

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Section heading | headline-md, 32px top margin | section-head | |
| Progress bar | 8px height, tertiary_fixed track, tertiary fill, xl radius, animated | progress-monthly | Reflects % of monthly target completed |
| Stats row | '18 MODULES DONE' left, '6 REMAINING' right, label-sm uppercase, on_surface_variant | progress-stats | Below the bar |
| Report button | Primary gradient button 'Generate Report', full width, 52px, xl radius | btn-report | Opens detailed analytics view |

---

## 8. Screen 3 — Quiz Screen

### 8.1 Screen Purpose

The quiz screen is the primary engagement engine. It must be distraction-free, clear, and motivating. The student should feel focused and confident — never confused. The design strips back to essential elements only.

### 8.2 Header

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Logo + Name | 24px logo icon + 'GyanPath' headline-md, top-left | header-logo | Minimal — no coin display in quiz to reduce distraction |
| Timer | secondary_container pill — clock icon + MM:SS, label-lg Plus Jakarta | quiz-timer | Counts down. Turns red below 30 seconds. |

### 8.3 Module Context

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Module label | 'CURRENT MODULE' in label-sm, on_surface_variant, uppercase | module-label | Above the module title |
| Module title | display-md Plus Jakarta, primary color, -0.02em letter-spacing | module-title | e.g., 'Ancient Indian Economics' |
| Question counter | 'Question 05 / 10' — 'Question' in body-sm on_surface_variant, '05' in display-sm primary | question-counter | Right-aligned, creates intentional asymmetry |
| Progress bar | 8px thick, tertiary_fixed track, tertiary fill, 16px top margin | quiz-progress | Fills as questions completed (5/10 = 50%) |

### 8.4 Question Card

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Container | surface_container_lowest (#ffffff) bg, xl radius, 24px padding, Level 2 elevation, 32px top margin | question-card | Main focus area — never add a border or shadow beyond Level 2 |
| Question text | headline-md Inter, on_surface (#0d1c2e), 1.6 line-height | question-text | Question number watermark (e.g., '05') in on_surface at 5% opacity as background element |
| Answer options | surface_container_low bg each, xl radius, 16px vertical padding, 12px top gap between each | option-card | NEVER use a divider line between options |
| Option selected | primary (#24389c) fill, white text + bold, check icon right-aligned 20px | option-selected | B option shows this state in the reference screen |
| Letter badge | 36px circle, surface_container_high bg, primary label-lg — turns white on selection | option-letter | A, B, C, D consistent alignment |

### 8.5 Action Row

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Previous button | Tertiary — arrow-left icon + 'Previous Question' text, on_surface, body-md | btn-prev | Center aligned, 32px top margin from last option |
| Hint button | surface_container_high bg, primary text, lightbulb icon, 'Use Hint (-5 Coins)', xl radius, full width | btn-hint | Cost shown inline — deters overuse. Uses glass-like treatment. |
| Submit button | Primary gradient, white text 'Submit Answer →', xl radius, 52px height, full width | btn-submit | Always full width. Dominant CTA. |

---

## 9. Screen 4 — AI Assistant (Digital Mentor)

### 9.1 Screen Purpose

The AI Assistant is branded as "Your Personal Digital Mentor." It must feel warm, intelligent, and conversational — like a knowledgeable tutor, not a cold chatbot. The asymmetric bubble design creates organic conversation flow.

### 9.2 Header

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Avatar | Student photo circle 40px top-left | avatar-user | |
| App name | headline-md 'GyanPath' center | header-title | |
| Coin balance | secondary_container pill with coin count | header-coins | |
| More menu | 3-dot vertical icon, 24px, on_surface_variant | header-more | Opens settings, history, export |

### 9.3 Mentor Introduction Block

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Bot icon container | 88px circle, primary gradient fill, white robot icon 48px | mentor-icon | Centered, 32px top margin |
| Headline | display-md 'Your Personal Digital Mentor', Plus Jakarta, on_surface, center | mentor-headline | |
| Subtext | body-md on_surface_variant, center, max 2 lines, 16px top margin | mentor-sub | 'I'm here to help you master your curriculum...' |

### 9.4 Chat Messages

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| AI message bubble | surface_container_high (#dce9ff) bg, lg radius, bottom-left 0, max-width 85%, left-aligned | bubble-ai | Padding 16px. Body-md Inter on_surface text. |
| User message bubble | primary (#24389c) bg, white text, lg radius, bottom-right 0, right-aligned, max-width 80% | bubble-user | Padding 16px. Body-md Inter white text. |
| AI avatar | 32px circle, primary bg, white robot icon, top-left of message, 8px right gap | avatar-ai | Appears only on first AI message in a group |
| User avatar | 32px circle, student photo, top-right of message, 8px left gap | avatar-user-msg | Appears only on first user message in a group |
| Message spacing | 16px between message bubbles, 24px between conversation turns | chat-spacing | |
| Key Formula card | surface_container_lowest bg, lg radius, 16px padding inside AI bubble, 'KEY FORMULA' label in primary label-sm uppercase + left border accent | formula-card | Nested inside AI message for mathematical content |

### 9.5 Input Bar

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Container | surface at 80% opacity, blur(20px), fixed bottom above nav bar, 16px padding | input-bar | Glassmorphism treatment |
| Suggestion chips | Horizontal scrollable row, surface_container_high bg, primary text, lg radius, 32px height | chips-suggest | 'Explain completing the square', 'Review my errors' etc. |
| Text field | surface_container_low bg, xl radius, 48px height, body-md placeholder | input-field | 'Type your question here...' placeholder |
| Attach button | 40px circle, on_surface_variant icon | btn-attach | '+' icon — attaches photos, documents |
| Voice button | 40px circle, on_surface_variant microphone icon | btn-voice | Tap-and-hold to dictate |
| Send button | 40px circle, primary bg, white arrow icon | btn-send | Active when text field non-empty |

---

## 10. Screen 5 — Battle Arena (Dark Mode)

### 10.1 Screen Purpose

The Battle Arena is the most game-like screen in the app. It uses a dark theme (#0d1117 base) to create atmosphere and excitement. The matchmaking state shown has player avatar vs '?' opponent with a scanning animation.

### 10.2 Layout Specifications

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Screen bg | dark_surface (#0d1117) full screen | dark-bg | Only screen in full dark mode by default |
| Header | Back arrow (white) + 'Battle Arena' headline-md white + coin balance pill top-right | battle-header | Semi-transparent surface at 20% opacity |
| Subject chip | secondary_container (#ff9800) bg, flask icon, 'Quantum Physics' label-lg on_secondary_container text, xl radius | chip-subject | Current battle subject — center aligned |
| Player card (you) | dark_surface_low (#161b22) bg, xl radius, 160px × 160px, student avatar photo, 'YOU' badge in primary | player-card | Left side of VS layout |
| VS separator | display-md 'VS' in primary_container text, Plus Jakarta, center | vs-text | |
| Opponent card | dark_surface_low bg, xl radius, 160px × 160px, '?' at 40% opacity, 'Searching...' label | opponent-card | Right side — shows opponent when matched |
| Stats row | dark_surface_low card, two columns: ENTRY FEE / WINNING PRIZE with Plus Jakarta numbers | stats-row | ENTRY FEE: secondary icon + '50'. WINNING PRIZE: trophy icon + '90' |
| Scan progress | 'Scanning for expert rivals' body-sm + timer '00:14' — 8px progress bar primary fill on dark track | scan-progress | Animated left-to-right fill |
| Cancel link | 'X Cancel Matchmaking' tertiary, center, on_surface_variant color | btn-cancel | 32px top margin from progress bar |

---

## 11. Screen 6 — Digital Library (Dark Mode)

### 11.1 Screen Purpose

The Digital Library is a premium content discovery experience. The 'Scholar' branding and dark aesthetic creates an atmosphere of serious study. It surfaces progress, recent reads, categories, and saved notes.

### 11.2 Layout Specifications

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Screen bg | dark_surface (#0d1117) full screen | dark-bg | Library uses dark mode for immersive reading feel |
| Header | 'The Scholar' label-lg white + search icon 24px top-right | library-header | Minimal — search is key action |
| Title block | display-md 'Digital Library' white + body-md dark muted subtitle | library-title | Left-aligned, 24px top margin |
| Search bar | dark_surface_low (#161b22) bg, xl radius, 48px height, magnifier icon, white placeholder | search-bar | Full width, 16px top margin |
| Study Tracker card | dark_surface_high (#1f2937) bg, xl radius, 'LIVE PROGRESS' chip in secondary + 'My Study Tracker' headline-md white | tracker-card | 'You've reached 82% of your weekly goal' — 82% in primary_container color |
| Tracker stats | Two columns: '3 Books in progress' + '45 Pages read today' — numbers in primary_container display-sm | tracker-stats | |
| Recent Reads | Horizontal scroll cards 160px wide, book cover image, title below, category label body-sm muted | recent-reads | 'View All' link right-aligned in primary_container |
| Subject Categories | 2×2 grid, dark_surface_low bg cards xl radius, icon centered 24px primary, label body-md white | category-grid | Mathematics, Science, Economics, English |
| Bookmark card | dark_surface_low bg, xl radius, colored accent icon, title headline-sm, subject + PDF + size tags | bookmark-card | Tags use dark_surface_high bg, label-sm muted text |
| Practice card | primary bg, xl radius, title primary_container, 'Start Practice' white button | practice-card | Featured mock exam card with CTA |

---

## 12. Screen 7 — Wallet (Dark Mode)

### 12.1 Screen Purpose

The Wallet screen manages Gyan Coins — the platform's reward currency. It must communicate trust, transparency, and clarity. The glass card treatment emphasizes the premium value of coins.

### 12.2 Layout Specifications

| Element | Spec / Value | Token | Notes |
|---------|-------------|-------|-------|
| Header | Avatar + 'Luminous Academy' label-lg white + '1,240 Coins' in primary_container | wallet-header | Brand name shown — supports multi-institution deployments |
| Glass balance card | primary (#24389c) at 70% opacity, blur(20px), xl radius, full width, 140px height | card-glass | 'AVAILABLE BALANCE' label-sm white above balance |
| Balance | display-sm '1,240' Plus Jakarta white + 'Gyan Coins' body-md white | wallet-balance | Large prominent number with coin label below |
| INR conversion | dark surface pill '≈ ₹1,240.00 INR' body-sm, on_surface_variant | wallet-inr | Approximate real-money value |
| Action buttons | 3 buttons: REDEEM, UPGRADE, REFER — dark_surface_low bg, xl radius, 64px square, icon + label | wallet-actions | Centered below glass card, 24px gap |
| Settlement policy | Info box: secondary icon + 'Settlement Policy' + description with 70% UPI / 30% Wallet in secondary color | policy-box | Critical information — always visible, never hidden |
| Recent Activity | Section heading + 'View All' link + transaction rows | activity-section | No divider lines between rows — 16px gap only |
| Transaction row | 40px icon circle (dark_surface_low) + name headline-sm + date body-sm muted + amount right | tx-row | Credit: + tertiary color. Debit: - red/error color |

---

## 13. Screen 8 — Home Dashboard (Dark Mode Variant)

### 13.1 Screen Purpose

The dark home variant demonstrates the platform's full dark mode capability. All component shapes, spacing, and hierarchy are identical to the light home — only surface and text colors change. This ensures design consistency and easy theme switching.

### 13.2 Dark Mode Mapping

| Light Mode Token | Dark Mode Token | Component |
|---------------|---------------|----------|
| surface (#f8f9ff) | dark_surface (#0d1117) | Screen background |
| surface_container_low (#eef1fb) | dark_surface_low (#161b22) | Card backgrounds |
| surface_container_high (#dce9ff) | dark_surface_high (#1f2937) | Elevated elements |
| on_surface (#0d1c2e) | dark_on_surface (#e6edf3) | Primary text |
| on_surface_variant (#454652) | dark_on_surf_var (#8b949e) | Secondary text |
| primary (#24389c) | primary (#24389c) — unchanged | Accent, CTAs, headings |
| secondary (#8b5000) | secondary (#8b5000) — unchanged | Coins, rewards |

**Dark Mode Rule**

- Primary, Secondary, and Tertiary accent colors remain IDENTICAL in both modes.
- Only surface colors and text colors change. This keeps brand recognition and component appearance consistent.
- Never add extra glow or bloom effects in dark mode — maintain the No-Line and Ambient Softness rules.

---

## 14. Navigation System

### 14.1 Bottom Navigation Tabs

Both light and dark versions use the same 5-tab bottom navigation structure. The active tab uses a primary pill indicator with white icon. All tabs have labels.

| Tab | Icon | Label | Active State |
|-----|------|-------|------------|
| 1 | house | Home | Primary pill bg, filled house icon white |
| 2 | book-open | Library | Primary pill bg, filled book icon white |
| 3 | question-square | Quiz | Primary pill bg, filled quiz icon white |
| 4 | robot | Assistant | Primary pill bg, filled robot icon white |
| 5 | wallet | Wallet | Primary pill bg, filled wallet icon white |

### 14.2 Navigation Transitions

- Screen transitions: slide from right for forward navigation, slide from left for back
- Tab switches: cross-fade 200ms — no slide between tabs
- Bottom sheet: slide up from bottom 300ms, cubic-bezier(0.4, 0, 0.2, 1)
- Card expand: scale from center 250ms ease-out

---

## 15. Design Do's and Don'ts

### DO

- Use 32px+ whitespace between major content blocks
- Use Plus Jakarta Sans for ALL numeric values
- Nest containers: surface_container_lowest on surface_container_low
- Use tonal shifts and whitespace to separate content sections
- Use xl radius (1.5rem) for buttons and lg radius (1rem) for cards
- Use ambient shadow only for Level 4 floating elements
- Test all screens in both light AND dark mode
- Apply glassmorphism only to nav bar and floating AI bubble
- Use -0.02em letter-spacing on all Plus Jakarta headlines
- Ensure coin/number displays use Plus Jakarta Sans

### DON'T

- Use a 1px solid border around cards — use tonal shifts instead
- Use pure black (#000000) for any text — use on_surface (#0d1c2e)
- Use default system drop-shadows — they break the premium feel
- Use hard 90-degree corners on any interactive element
- Add a divider line between quiz answer options
- Apply glassmorphism to content-heavy cards
- Use more than 2 font families (Plus Jakarta + Inter only)
- Use percentage-based widths in tables — always use DXA
- Animate content on every scroll — reserve animation for key actions
- Show raw error states without a branded error illustration

---

## 16. Developer Handoff Guidelines

### 16.1 CSS Custom Properties

**Root Token Definitions**

```css
--color-primary: #24389c;
--color-primary-container: #3f51b5;
--color-secondary: #8b5000;
--color-secondary-container: #ff9800;
--color-tertiary: #004e33;
--color-tertiary-fixed: #6ffbbe;
--color-surface: #f8f9ff;
--color-surface-low: #eef1fb;
--color-surface-high: #dce9ff;
--color-surface-lowest: #ffffff;
--color-on-surface: #0d1c2e;
--color-on-surface-variant: #454652;
--color-outline-variant: #c5c5d4;
--font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--radius-lg: 1rem;  /* 16px */
--radius-xl: 1.5rem;  /* 24px */
--shadow-ambient: 0 12px 32px rgba(13, 28, 46, 0.06);
```

### 16.2 React Native / Expo Theme Object

```typescript
const theme = {
  colors: {
    primary: '#24389c',
    primaryContainer: '#3f51b5',
    secondary: '#8b5000',
    secondaryContainer: '#ff9800',
    tertiary: '#004e33',
    tertiaryFixed: '#6ffbbe',
    surface: '#f8f9ff',
    surfaceLow: '#eef1fb',
    surfaceHigh: '#dce9ff',
    surfaceLowest: '#ffffff',
    onSurface: '#0d1c2e',
    onSurfaceVariant: '#454652',
  },
  fonts: { display: 'PlusJakartaSans', body: 'Inter' },
  radii: { lg: 16, xl: 24 },
};
```

### 16.3 Spacing Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| space-1 | 0.25rem | 4px | Icon internal padding |
| space-2 | 0.5rem | 8px | Badge padding, inline gaps |
| space-3 | 0.75rem | 12px | Card internal margin |
| space-4 | 1rem | 16px | Standard padding, row gaps |
| space-6 | 1.5rem | 24px | Card padding, section gaps |
| space-8 | 2rem | 32px | Major section whitespace |
| space-12 | 3rem | 48px | Hero section padding |

### 16.4 Accessibility Requirements

- All text must meet WCAG AA contrast ratio (4.5:1 for body, 3:1 for large text)
- All interactive elements must have ARIA labels (React Native: accessibilityLabel)
- Touch targets minimum 44×44 points on mobile — buttons must not be smaller
- Animations must respect prefers-reduced-motion — disable or reduce on system setting
- All images must have alt text — educational content especially
- Focus indicators must be visible at all times — use primary color ring

### 16.5 Asset Delivery

- Icons: Use a consistent icon library (Phosphor Icons or Material Symbols) — 24px base size, 2px stroke
- Illustrations: SVG format, viewBox normalized, colors using theme tokens
- Fonts: Self-host Plus Jakarta Sans and Inter — do not rely on CDN in production
- Images: WebP format, progressive loading, lazy-load below the fold
- App icon: 1024×1024 PNG, primary gradient background, white logo mark

---

## Document End

**Gyan Path UI/UX Design System — Version 1.0**

**April 2026 | Confidential | For design and development teams only**