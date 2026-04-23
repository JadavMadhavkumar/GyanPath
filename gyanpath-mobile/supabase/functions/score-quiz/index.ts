// Supabase Edge Function: Score Quiz
// Handles quiz scoring, coin rewards, and XP calculation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoreRequest {
  attempt_id: string;
}

interface QuizConfig {
  mode: string;
  question_count: number;
  coins_per_correct: number;
  xp_per_correct: number;
  bonus_multiplier: number;
}

const QUIZ_CONFIG: Record<string, Omit<QuizConfig, 'question_count'>> = {
  normal: { mode: 'normal', coins_per_correct: 2, xp_per_correct: 10, bonus_multiplier: 1.0 },
  fast: { mode: 'fast', coins_per_correct: 3, xp_per_correct: 15, bonus_multiplier: 1.2 },
  rapid_fire: { mode: 'rapid_fire', coins_per_correct: 4, xp_per_correct: 20, bonus_multiplier: 1.5 },
  extended: { mode: 'extended', coins_per_correct: 5, xp_per_correct: 25, bonus_multiplier: 1.3 },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { attempt_id }: ScoreRequest = await req.json();

    if (!attempt_id) {
      throw new Error('attempt_id is required');
    }

    // Get attempt with quiz and answers
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('quiz_attempts')
      .select(`
        id,
        user_id,
        quiz_id,
        quizzes (
          id,
          mode,
          question_count,
          quiz_questions (
            question_id,
            questions (
              id,
              correct_option
            )
          )
        ),
        attempt_answers (
          question_id,
          selected_option
        )
      `)
      .eq('id', attempt_id)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Attempt not found');
    }

    const quiz = attempt.quizzes;
    const config = QUIZ_CONFIG[quiz.mode] || QUIZ_CONFIG.normal;
    const answers = attempt.attempt_answers || [];

    // Build question -> correct answer map
    const correctAnswers = new Map<string, string>();
    for (const qq of quiz.quiz_questions) {
      correctAnswers.set(qq.question_id, qq.questions.correct_option);
    }

    // Score the quiz
    let correctCount = 0;
    let wrongCount = 0;

    for (const answer of answers) {
      const correct = correctAnswers.get(answer.question_id);
      if (answer.selected_option === correct) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const totalQuestions = quiz.question_count;
    const skipped = totalQuestions - answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Calculate rewards
    let coinsEarned = correctCount * config.coins_per_correct;
    let xpEarned = correctCount * config.xp_per_correct;

    // Perfect score bonus
    if (correctCount === totalQuestions) {
      coinsEarned = Math.round(coinsEarned * 1.5);
      xpEarned = Math.round(xpEarned * 1.5);
    }

    // Apply mode multiplier
    coinsEarned = Math.round(coinsEarned * config.bonus_multiplier);
    xpEarned = Math.round(xpEarned * config.bonus_multiplier);

    // Update attempt with results
    const { error: updateError } = await supabaseClient
      .from('quiz_attempts')
      .update({
        score,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        coins_earned: coinsEarned,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt_id);

    if (updateError) {
      throw new Error(`Failed to update attempt: ${updateError.message}`);
    }

    // Credit coins to user wallet
    if (coinsEarned > 0) {
      // Get user wallet
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .select('id, balance')
        .eq('user_id', attempt.user_id)
        .single();

      if (!walletError && wallet) {
        // Create wallet transaction
        await supabaseClient.from('wallet_transactions').insert({
          wallet_id: wallet.id,
          type: 'credit',
          amount: coinsEarned,
          source: 'quiz_reward',
          reference_id: attempt_id,
          description: `Quiz reward: ${correctCount}/${totalQuestions} correct`,
          balance_after: wallet.balance + coinsEarned,
        });

        // Update wallet balance
        await supabaseClient
          .from('wallets')
          .update({ balance: wallet.balance + coinsEarned })
          .eq('id', wallet.id);
      }
    }

    // Update user XP
    if (xpEarned > 0) {
      const { data: user } = await supabaseClient
        .from('users')
        .select('total_xp')
        .eq('id', attempt.user_id)
        .single();

      if (user) {
        await supabaseClient
          .from('users')
          .update({ total_xp: (user.total_xp || 0) + xpEarned })
          .eq('id', attempt.user_id);
      }
    }

    // Update user streak
    await supabaseClient.rpc('update_user_streak', { p_user_id: attempt.user_id });

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          score,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          skipped,
          coins_earned: coinsEarned,
          xp_earned: xpEarned,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
