# Gyan Path API Documentation

## Overview
Gyan Path uses Supabase as the backend, which provides:
- **Supabase Client SDK**: Direct database queries with RLS
- **Edge Functions**: Custom server-side logic
- **Realtime**: WebSocket subscriptions

Base URL (Production): `https://[project-ref].supabase.co`

---

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '+919876543210'
    }
  }
})
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut()
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Reset Password
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'gyanpath://reset-password' }
)
```

---

## User Management

### Get User Profile
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+919876543210",
  "avatar_url": "https://...",
  "role": "student",
  "class": "12th",
  "subjects": ["mathematics", "physics"],
  "language": "en",
  "is_verified": true,
  "is_blocked": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Profile
```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    full_name: 'John Smith',
    class: '12th',
    subjects: ['mathematics', 'physics', 'chemistry'],
    language: 'hi'
  })
  .eq('id', userId)
  .select()
  .single()
```

### Upload Avatar
```typescript
// Upload file
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    upsert: true
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`)

// Update profile
await supabase
  .from('users')
  .update({ avatar_url: publicUrl })
  .eq('id', userId)
```

---

## Membership

### Get Available Plans
```typescript
const { data, error } = await supabase
  .from('membership_plans')
  .select('*')
  .eq('is_active', true)
  .order('sort_order')
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "basic",
    "display_name": "Basic",
    "price_inr": 99.00,
    "duration_days": 30,
    "commission_rate": 0.01,
    "benefits": {
      "unlimited_quizzes": false,
      "daily_quiz_limit": 10,
      "ai_insights": false
    }
  }
]
```

### Get Current Membership
```typescript
const { data, error } = await supabase
  .from('user_memberships')
  .select(`
    *,
    plan:membership_plans(*)
  `)
  .eq('user_id', userId)
  .eq('status', 'active')
  .gte('expires_at', new Date().toISOString())
  .single()
```

### Create Membership Order (Edge Function)
**Endpoint:** `POST /functions/v1/create-membership-order`

**Request:**
```json
{
  "plan_id": "uuid",
  "auto_renew": false
}
```

**Response:**
```json
{
  "order_id": "order_xxxxx",
  "amount": 10098,
  "currency": "INR",
  "key_id": "rzp_test_xxxxx",
  "notes": {
    "plan_id": "uuid",
    "user_id": "uuid"
  }
}
```

### Verify Payment (Edge Function)
**Endpoint:** `POST /functions/v1/verify-payment`

**Request:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "membership": {
    "id": "uuid",
    "plan_id": "uuid",
    "status": "active",
    "expires_at": "2024-02-01T00:00:00Z"
  },
  "invoice_url": "https://..."
}
```

---

## Wallet

### Get Wallet Balance
```typescript
const { data, error } = await supabase
  .from('wallets')
  .select('*')
  .eq('user_id', userId)
  .single()
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "coin_balance": 500,
  "cash_balance": 0.00,
  "total_earned_coins": 1200,
  "total_spent_coins": 700,
  "daily_limit": 1000,
  "monthly_limit": 10000,
  "is_locked": false
}
```

### Get Transaction History
```typescript
const { data, error } = await supabase
  .from('wallet_transactions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "credit_reward",
    "currency": "coin",
    "amount": 50,
    "balance_before": 450,
    "balance_after": 500,
    "reference_type": "quiz",
    "reference_id": "quiz_uuid",
    "description": "Quiz completion reward",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Credit/Debit Wallet (Edge Function - Server Only)
**Endpoint:** `POST /functions/v1/wallet-operation`

**Request:**
```json
{
  "user_id": "uuid",
  "operation": "credit",
  "type": "credit_reward",
  "currency": "coin",
  "amount": 50,
  "reference_type": "quiz",
  "reference_id": "quiz_uuid",
  "description": "Quiz completion reward"
}
```

**Response:**
```json
{
  "success": true,
  "new_balance": 500,
  "transaction_id": "uuid"
}
```

---

## Quiz & Questions

### Get Subjects
```typescript
const { data, error } = await supabase
  .from('subjects')
  .select('*')
  .eq('is_active', true)
  .order('sort_order')
```

### Get Questions for Quiz
```typescript
const { data, error } = await supabase
  .from('questions')
  .select('id, question_text, question_text_hi, options, difficulty, image_url')
  .eq('subject_id', subjectId)
  .eq('status', 'approved')
  .eq('difficulty', difficulty) // optional
  .limit(10)
  .order('RANDOM()') // Supabase random ordering
```

**Note:** Correct answers are NOT returned to prevent cheating.

### Start Quiz Attempt
```typescript
const { data, error } = await supabase
  .from('quiz_attempts')
  .insert({
    user_id: userId,
    quiz_id: quizId,
    total_questions: 10,
    status: 'in_progress'
  })
  .select()
  .single()
```

### Submit Answer
```typescript
const { data, error } = await supabase
  .from('attempt_answers')
  .insert({
    attempt_id: attemptId,
    question_id: questionId,
    selected_option_id: 'option_a',
    time_taken_ms: 5200
  })
  .select()
  .single()
```

### Complete Quiz (Edge Function)
**Endpoint:** `POST /functions/v1/complete-quiz`

**Request:**
```json
{
  "attempt_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "total_questions": 10,
    "correct_answers": 7,
    "wrong_answers": 2,
    "skipped": 1,
    "score": 85,
    "time_taken_seconds": 180,
    "coins_earned": 35,
    "rank": 42,
    "answers": [
      {
        "question_id": "uuid",
        "selected": "option_a",
        "correct": "option_a",
        "is_correct": true,
        "explanation": "Because..."
      }
    ]
  }
}
```

### Get Leaderboard
```typescript
const { data, error } = await supabase
  .from('leaderboard_entries')
  .select(`
    rank,
    score,
    total_attempts,
    user:users(id, full_name, avatar_url)
  `)
  .eq('scope', 'global')
  .eq('period', '2024-01')
  .order('rank')
  .limit(100)
```

### Get Daily Question
```typescript
const today = new Date().toISOString().split('T')[0]
const { data, error } = await supabase
  .from('daily_questions')
  .select(`
    *,
    question:questions(
      id, question_text, question_text_hi, 
      options, difficulty, image_url
    )
  `)
  .eq('date', today)
  .single()
```

---

## Question Contribution

### Create Question
```typescript
const { data, error } = await supabase
  .from('questions')
  .insert({
    subject_id: subjectId,
    created_by: userId,
    question_text: 'What is 2 + 2?',
    question_text_hi: '2 + 2 क्या है?',
    question_type: 'mcq',
    options: [
      { id: 'a', text: '3', text_hi: '3' },
      { id: 'b', text: '4', text_hi: '4' },
      { id: 'c', text: '5', text_hi: '5' },
      { id: 'd', text: '6', text_hi: '6' }
    ],
    correct_option_id: 'b',
    explanation: 'Basic addition',
    difficulty: 'easy',
    tags: ['arithmetic', 'addition'],
    status: 'pending'
  })
  .select()
  .single()
```

### Check for Duplicates (Edge Function)
**Endpoint:** `POST /functions/v1/check-duplicate`

**Request:**
```json
{
  "question_text": "What is 2 + 2?"
}
```

**Response:**
```json
{
  "is_duplicate": true,
  "similarity_score": 0.95,
  "similar_question_id": "uuid"
}
```

### Get My Questions
```typescript
const { data, error } = await supabase
  .from('questions')
  .select('*')
  .eq('created_by', userId)
  .order('created_at', { ascending: false })
```

---

## Educational Materials

### List Materials
```typescript
const { data, error } = await supabase
  .from('materials')
  .select(`
    *,
    subject:subjects(name, display_name)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Get Material Details
```typescript
const { data, error } = await supabase
  .from('materials')
  .select(`
    *,
    subject:subjects(name, display_name)
  `)
  .eq('id', materialId)
  .single()
```

### Check Purchase Status
```typescript
const { data, error } = await supabase
  .from('material_purchases')
  .select('*')
  .eq('user_id', userId)
  .eq('material_id', materialId)
  .eq('status', 'completed')
  .maybeSingle()
```

### Purchase with Coins (Edge Function)
**Endpoint:** `POST /functions/v1/purchase-material`

**Request:**
```json
{
  "material_id": "uuid",
  "payment_type": "coins"
}
```

**Response:**
```json
{
  "success": true,
  "purchase_id": "uuid",
  "download_url": "https://...",
  "new_coin_balance": 350
}
```

### Download Material
```typescript
// Get signed URL (for purchased materials)
const { data, error } = await supabase.storage
  .from('materials')
  .createSignedUrl(`${materialId}/file.pdf`, 3600) // 1 hour expiry
```

---

## AI Insights

### Get Performance Analysis (Edge Function)
**Endpoint:** `POST /functions/v1/ai-analysis`

**Request:**
```json
{
  "type": "performance_analysis",
  "subject_id": "uuid" // optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "performance_analysis",
  "content": {
    "overall_score": 72,
    "trend": "improving",
    "subjects": [
      {
        "name": "Mathematics",
        "accuracy": 85,
        "attempts": 45,
        "trend": "stable"
      }
    ],
    "summary": "You're showing consistent improvement in Physics..."
  },
  "created_at": "2024-01-15T00:00:00Z"
}
```

### Get Weak Areas
**Endpoint:** `POST /functions/v1/ai-analysis`

**Request:**
```json
{
  "type": "weak_areas"
}
```

**Response:**
```json
{
  "content": {
    "weak_topics": [
      {
        "subject": "Mathematics",
        "topic": "Trigonometry",
        "accuracy": 45,
        "recommendation": "Practice more identity problems"
      }
    ],
    "recommended_actions": [
      "Complete 5 trigonometry quizzes this week",
      "Review the formulas in the notes section"
    ]
  }
}
```

### Get Daily Tip
```typescript
const { data, error } = await supabase
  .from('ai_insights')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'daily_tip')
  .gte('created_at', new Date().toISOString().split('T')[0])
  .maybeSingle()

// If no tip today, request one
if (!data) {
  // Call edge function to generate
}
```

### Get Recommendations
**Endpoint:** `POST /functions/v1/ai-analysis`

**Request:**
```json
{
  "type": "recommendations"
}
```

**Response:**
```json
{
  "content": {
    "quizzes": [
      {
        "id": "uuid",
        "title": "Trigonometry Practice",
        "reason": "Based on your weak areas"
      }
    ],
    "materials": [
      {
        "id": "uuid",
        "title": "Trig Formulas Cheatsheet",
        "reason": "Helps with your identified gaps"
      }
    ]
  }
}
```

---

## Notifications

### Get Notifications
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
```

### Mark as Read
```typescript
const { error } = await supabase
  .from('notifications')
  .update({ 
    is_read: true, 
    read_at: new Date().toISOString() 
  })
  .eq('id', notificationId)
  .eq('user_id', userId)
```

### Mark All as Read
```typescript
const { error } = await supabase
  .from('notifications')
  .update({ 
    is_read: true, 
    read_at: new Date().toISOString() 
  })
  .eq('user_id', userId)
  .eq('is_read', false)
```

### Subscribe to New Notifications
```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new)
    }
  )
  .subscribe()
```

---

## Admin APIs

### List Users (Admin Only)
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 49) // pagination
```

### Search Users
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
  .limit(20)
```

### Block/Unblock User
```typescript
const { error } = await supabase
  .from('users')
  .update({ is_blocked: true })
  .eq('id', userId)

// Log action
await supabase.from('admin_action_logs').insert({
  admin_id: adminId,
  action: 'block_user',
  target_type: 'user',
  target_id: userId,
  reason: 'Spam activity'
})
```

### Get Pending Questions
```typescript
const { data, error } = await supabase
  .from('questions')
  .select(`
    *,
    created_by:users(id, full_name, email),
    subject:subjects(name, display_name)
  `)
  .eq('status', 'pending')
  .order('created_at')
```

### Approve/Reject Question
```typescript
const { error } = await supabase
  .from('questions')
  .update({ 
    status: 'approved', // or 'rejected'
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    rejection_reason: null // or reason if rejected
  })
  .eq('id', questionId)
```

### Adjust Wallet (Admin)
**Endpoint:** `POST /functions/v1/admin-wallet-adjust`

**Request:**
```json
{
  "user_id": "uuid",
  "operation": "credit",
  "currency": "coin",
  "amount": 100,
  "reason": "Compensation for bug"
}
```

### Get Revenue Report
```typescript
const { data, error } = await supabase
  .from('payment_transactions')
  .select('*')
  .eq('status', 'captured')
  .gte('created_at', startDate)
  .lte('created_at', endDate)

// Aggregate in application or use Supabase functions
```

### Get Dashboard Stats
```typescript
// Multiple queries for dashboard
const [users, transactions, questions] = await Promise.all([
  supabase.from('users').select('id', { count: 'exact', head: true }),
  supabase.from('payment_transactions')
    .select('amount_paisa')
    .eq('status', 'captured')
    .gte('created_at', today),
  supabase.from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
])
```

---

## Error Handling

All APIs return errors in this format:

```json
{
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INSUFFICIENT_BALANCE` | 400 | Not enough coins/cash |
| `DUPLICATE_ENTRY` | 409 | Record already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal error |

### Client-Side Error Handling
```typescript
const { data, error } = await supabase.from('users').select()

if (error) {
  if (error.code === 'PGRST116') {
    // No rows returned
  } else if (error.code === '42501') {
    // RLS policy violation
  } else {
    // Generic error
    console.error(error.message)
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth (signup/login) | 10/minute |
| AI Analysis | 5/user/day |
| Question Submission | 10/user/day |
| Quiz Completion | 50/user/day |
| Wallet Operations | 100/user/day |

---

## Webhooks

### Razorpay Payment Webhook
**Endpoint:** `POST /functions/v1/razorpay-webhook`

**Headers:**
```
X-Razorpay-Signature: <signature>
```

**Events Handled:**
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `refund.created` - Refund processed

---

## Realtime Subscriptions

### Wallet Updates
```typescript
supabase
  .channel('wallet')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'wallets',
    filter: `user_id=eq.${userId}`
  }, handleWalletUpdate)
  .subscribe()
```

### Leaderboard Updates
```typescript
supabase
  .channel('leaderboard')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'leaderboard_entries',
    filter: `scope=eq.global`
  }, handleLeaderboardUpdate)
  .subscribe()
```
