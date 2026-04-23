import { getSupabaseAdmin } from '../lib/supabase';
import {
  Question,
  Quiz,
  QuizAttempt,
  AttemptAnswer,
  QuizResult,
  LeaderboardEntry,
  CreateQuestionInput,
  CreateQuizInput,
  UpdateQuestionInput,
  DailyQuestion,
  SCORING,
  QUIZ_MODE_TIME_LIMITS,
} from '../types';
import { walletService } from './walletService';
import logger from '../utils/logger';

class QuizService {
  /**
   * Get all subjects
   */
  async getSubjects() {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get approved questions for a quiz
   */
  async getQuestions(params: {
    subject_id?: string;
    difficulty?: string;
    limit?: number;
    exclude_ids?: string[];
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('questions')
      .select('id, question_text, question_text_hi, options, difficulty, image_url, video_url, subject_id')
      .eq('status', 'approved');

    if (params.subject_id) {
      query = query.eq('subject_id', params.subject_id);
    }

    if (params.difficulty && params.difficulty !== 'mixed') {
      query = query.eq('difficulty', params.difficulty);
    }

    if (params.exclude_ids && params.exclude_ids.length > 0) {
      query = query.not('id', 'in', `(${params.exclude_ids.join(',')})`);
    }

    const { data, error } = await query
      .limit(params.limit || 10)
      .order('RANDOM()');

    if (error) {
      throw error;
    }

    return data as Partial<Question>[];
  }

  /**
   * Create a question (pending approval)
   */
  async createQuestion(userId: string, input: CreateQuestionInput) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...input,
        created_by: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Question created by user ${userId}: ${data.id}`);

    return data as Question;
  }

  /**
   * Update question (only if pending)
   */
  async updateQuestion(questionId: string, userId: string, input: UpdateQuestionInput) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('questions')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .eq('created_by', userId)
      .in('status', ['draft', 'pending'])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Question;
  }

  /**
   * Approve/reject question (admin)
   */
  async approveQuestion(questionId: string, status: 'approved' | 'rejected', adminId: string, rejectionReason?: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('questions')
      .update({
        status,
        approved_by: adminId,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Question ${questionId} ${status} by admin ${adminId}`);

    return data as Question;
  }

  /**
   * Get pending questions (admin)
   */
  async getPendingQuestions(page: number = 1, limit: number = 20) {
    const supabase = getSupabaseAdmin();

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('questions')
      .select(`
        *,
        created_by:users!questions_created_by_fkey(id, full_name, email),
        subject:subjects(name, display_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      questions: data,
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Create a quiz
   */
  async createQuiz(input: CreateQuizInput, createdBy?: string) {
    const supabase = getSupabaseAdmin();

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: input.title,
        title_hi: input.title_hi,
        description: input.description,
        subject_id: input.subject_id,
        mode: input.mode,
        difficulty: input.difficulty || 'mixed',
        question_count: input.question_count,
        time_limit_seconds: input.time_limit_seconds,
        passing_score: input.passing_score || 60,
        is_official: input.is_official || false,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
        created_by: createdBy,
      })
      .select()
      .single();

    if (quizError) {
      throw quizError;
    }

    // Link questions if provided
    if (input.question_ids && input.question_ids.length > 0) {
      const quizQuestions = input.question_ids.map((qid, index) => ({
        quiz_id: quiz.id,
        question_id: qid,
        sort_order: index,
      }));

      await supabase.from('quiz_questions').insert(quizQuestions);
    }

    logger.info(`Quiz created: ${quiz.id}`);

    return quiz as Quiz;
  }

  /**
   * Get quiz details
   */
  async getQuiz(quizId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (error) {
      throw error;
    }

    return data as Quiz;
  }

  /**
   * Start quiz attempt
   */
  async startAttempt(userId: string, quizId: string) {
    const supabase = getSupabaseAdmin();

    // Get quiz details
    const quiz = await this.getQuiz(quizId);

    if (!quiz.is_active) {
      throw new Error('Quiz is not active');
    }

    // Check if quiz is within time window
    const now = new Date();
    if (quiz.starts_at && new Date(quiz.starts_at) > now) {
      throw new Error('Quiz has not started yet');
    }
    if (quiz.ends_at && new Date(quiz.ends_at) < now) {
      throw new Error('Quiz has ended');
    }

    // Create attempt
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        total_questions: quiz.question_count,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as QuizAttempt;
  }

  /**
   * Submit answer for a quiz attempt
   */
  async submitAnswer(attemptId: string, questionId: string, selectedOptionId: string | null, timeTakenMs: number) {
    const supabase = getSupabaseAdmin();

    // Get correct answer
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('correct_option_id')
      .eq('id', questionId)
      .single();

    if (qError) {
      throw qError;
    }

    const isCorrect = question.correct_option_id === selectedOptionId;

    // Record answer
    const { data, error } = await supabase
      .from('attempt_answers')
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        time_taken_ms: timeTakenMs,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as AttemptAnswer;
  }

  /**
   * Complete quiz and calculate score
   */
  async completeQuiz(attemptId: string, userId: string) {
    const supabase = getSupabaseAdmin();

    // Get attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*, quiz:quizzes(*)')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new Error('Attempt already completed or abandoned');
    }

    // Get all answers
    const { data: answers, error: answersError } = await supabase
      .from('attempt_answers')
      .select('*, question:questions(correct_option_id, explanation, explanation_hi)')
      .eq('attempt_id', attemptId);

    if (answersError) {
      throw answersError;
    }

    // Calculate score
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skipped = 0;
    let totalScore = 0;
    let totalTimeTaken = 0;

    const answerResults = answers.map((answer) => {
      const isCorrect = answer.is_correct || false;
      const timeTaken = answer.time_taken_ms || 0;

      if (!answer.selected_option_id) {
        skipped++;
      } else if (isCorrect) {
        correctAnswers++;
        // Calculate time bonus
        const timeLimit = attempt.quiz.time_limit_seconds || 30;
        const timeBonus = Math.max(0, ((timeLimit * 1000 - timeTaken) / (timeLimit * 1000)) * SCORING.MAX_TIME_BONUS);
        totalScore += SCORING.BASE_SCORE_PER_CORRECT + timeBonus;
      } else {
        wrongAnswers++;
      }

      totalTimeTaken += timeTaken;

      return {
        question_id: answer.question_id,
        selected: answer.selected_option_id,
        correct: answer.question.correct_option_id,
        is_correct: isCorrect,
        explanation: answer.question.explanation,
      };
    });

    const finalScore = Math.round(totalScore);
    const coinsEarned = Math.floor(finalScore / SCORING.COIN_DIVISOR);
    const timeTakenSeconds = Math.floor(totalTimeTaken / 1000);

    // Update attempt
    const { error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        skipped,
        score: finalScore,
        time_taken_seconds: timeTakenSeconds,
        coins_earned: coinsEarned,
      })
      .eq('id', attemptId);

    if (updateError) {
      throw updateError;
    }

    // Credit coins
    if (coinsEarned > 0) {
      await walletService.creditReward(userId, coinsEarned, 'quiz', attemptId);
    }

    // Update leaderboard
    await this.updateLeaderboard(userId, finalScore, attempt.quiz.subject_id);

    logger.info(`Quiz completed: ${attemptId}, Score: ${finalScore}, Coins: ${coinsEarned}`);

    return {
      total_questions: attempt.total_questions,
      correct_answers: correctAnswers,
      wrong_answers: wrongAnswers,
      skipped,
      score: finalScore,
      time_taken_seconds: timeTakenSeconds,
      coins_earned: coinsEarned,
      answers: answerResults,
    } as QuizResult;
  }

  /**
   * Update leaderboard
   */
  private async updateLeaderboard(userId: string, score: number, subjectId?: string) {
    const supabase = getSupabaseAdmin();

    // Update global leaderboard
    await this.updateLeaderboardScope(userId, score, 'global', null);

    // Update subject leaderboard if applicable
    if (subjectId) {
      await this.updateLeaderboardScope(userId, score, 'subject', subjectId);
    }
  }

  private async updateLeaderboardScope(
    userId: string,
    score: number,
    scope: string,
    scopeId: string | null
  ) {
    const supabase = getSupabaseAdmin();
    const period = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Get current stats
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      throw error;
    }

    const totalAttempts = attempts?.length || 0;
    const totalScore = attempts?.reduce((sum, a) => sum + a.score, 0) || 0;
    const accuracy = totalAttempts > 0 ? (totalScore / (totalAttempts * 100)) * 100 : 0;

    // Upsert leaderboard entry
    const { error: upsertError } = await supabase
      .from('leaderboard_entries')
      .upsert({
        user_id: userId,
        scope,
        scope_id: scopeId,
        period,
        score: totalScore,
        total_attempts: totalAttempts,
        accuracy_percent: accuracy,
        rank: 0, // Will be calculated by query
      }, {
        onConflict: 'user_id,scope,scope_id,period',
      });

    if (upsertError) {
      throw upsertError;
    }

    // Recalculate ranks
    await this.recalculateRanks(scope, scopeId, period);
  }

  private async recalculateRanks(scope: string, scopeId: string | null, period: string) {
    const supabase = getSupabaseAdmin();

    // Get all entries for this scope/period ordered by score
    const { data: entries, error } = await supabase
      .from('leaderboard_entries')
      .select('id, score')
      .eq('scope', scope)
      .eq('scope_id', scopeId || 'null')
      .eq('period', period)
      .order('score', { ascending: false });

    if (error) {
      throw error;
    }

    // Update ranks
    for (let i = 0; i < (entries?.length || 0); i++) {
      await supabase
        .from('leaderboard_entries')
        .update({ rank: i + 1 })
        .eq('id', entries[i].id);
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(params: {
    scope: string;
    scope_id?: string;
    period?: string;
    limit?: number;
    offset?: number;
  }) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('leaderboard_entries')
      .select(`
        rank,
        score,
        total_attempts,
        accuracy_percent,
        user:users(id, full_name, avatar_url)
      `)
      .eq('scope', params.scope);

    if (params.scope_id) {
      query = query.eq('scope_id', params.scope_id);
    }

    const period = params.period || new Date().toISOString().slice(0, 7);
    query = query.eq('period', period);

    const { data, error } = await query
      .order('rank')
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 100) - 1);

    if (error) {
      throw error;
    }

    return data as LeaderboardEntry[];
  }

  /**
   * Get daily question
   */
  async getDailyQuestion(date?: string) {
    const supabase = getSupabaseAdmin();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_questions')
      .select(`
        *,
        question:questions(
          id, question_text, question_text_hi, options, difficulty, image_url
        )
      `)
      .eq('date', targetDate)
      .eq('is_active', true)
      .single();

    if (error) {
      throw error;
    }

    return data as DailyQuestion;
  }

  /**
   * Get user's quiz attempts
   */
  async getUserAttempts(userId: string, limit: number = 20, offset: number = 0) {
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz:quizzes(title, title_hi, mode, subject_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      attempts: data,
      total: count || 0,
    };
  }
}

export const quizService = new QuizService();
