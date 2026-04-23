import { getSupabaseAdmin } from '../lib/supabase';
import { getOpenAI } from '../lib/openai';
import { getRedis } from '../lib/redis';
import { AIInsight, AIInsightType, AI_RATE_LIMITS } from '../types';
import logger from '../utils/logger';

class AIService {
  /**
   * Analyze user performance and generate insights
   */
  async analyzePerformance(userId: string, type: AIInsightType, subjectId?: string) {
    const supabase = getSupabaseAdmin();
    const openai = getOpenAI();
    const redis = getRedis();

    // Check cache
    const cacheKey = `ai:${userId}:${type}:${subjectId || 'all'}:${new Date().toISOString().split('T')[0]}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Gather user performance data
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        score,
        correct_answers,
        wrong_answers,
        total_questions,
        coins_earned,
        time_taken_seconds,
        quiz:quizzes(subject_id, mode)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Get subject-wise breakdown
    const subjectPerformance = this.calculateSubjectPerformance(attempts);

    // Calculate overall stats
    const totalAttempts = attempts?.length || 0;
    const avgScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;
    const avgAccuracy = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.correct_answers / a.total_questions) * 100, 0) / totalAttempts
      : 0;

    let content: any;

    switch (type) {
      case 'performance_analysis':
        content = await this.generatePerformanceAnalysis(
          openai,
          { totalAttempts, avgScore, avgAccuracy, subjectPerformance }
        );
        break;

      case 'weak_areas':
        content = await this.generateWeakAreasAnalysis(openai, subjectPerformance);
        break;

      case 'recommendations':
        content = await this.generateRecommendations(openai, subjectPerformance, attempts);
        break;

      case 'daily_tip':
        content = await this.generateDailyTip(openai, { totalAttempts, avgScore, subjectPerformance });
        break;

      case 'study_plan':
        content = await this.generateStudyPlan(openai, subjectPerformance, avgAccuracy);
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    // Store insight
    const { data: insight, error: insightError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        type,
        subject_id: subjectId || null,
        content,
        source_data: { totalAttempts, avgScore, avgAccuracy },
        model_version: 'gpt-4o-mini',
        expires_at: new Date(Date.now() + AI_RATE_LIMITS.CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insightError) {
      throw insightError;
    }

    // Cache result
    await redis.setex(cacheKey, AI_RATE_LIMITS.CACHE_TTL_HOURS * 3600, JSON.stringify(content));

    logger.info(`AI ${type} generated for user ${userId}`);

    return content;
  }

  private calculateSubjectPerformance(attempts: any[]) {
    const subjectMap = new Map<string, { total: number; correct: number; attempts: number }>();

    attempts.forEach((attempt) => {
      const subjectId = attempt.quiz?.subject_id || 'general';
      const existing = subjectMap.get(subjectId) || { total: 0, correct: 0, attempts: 0 };

      subjectMap.set(subjectId, {
        total: existing.total + attempt.total_questions,
        correct: existing.correct + attempt.correct_answers,
        attempts: existing.attempts + 1,
      });
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      attempts: data.attempts,
    }));
  }

  private async generatePerformanceAnalysis(openai: any, data: any) {
    const prompt = `Based on the following student performance data, provide a structured analysis:

Total Quiz Attempts: ${data.totalAttempts}
Average Score: ${data.avgScore.toFixed(2)}
Average Accuracy: ${data.avgAccuracy.toFixed(2)}%
Subject Performance: ${JSON.stringify(data.subjectPerformance)}

Provide:
1. Overall assessment (1-2 sentences)
2. Strengths identified
3. Areas needing improvement
4. Encouraging message
5. Specific next steps`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant analyzing student performance. Provide constructive, encouraging feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async generateWeakAreasAnalysis(openai: any, subjectPerformance: any[]) {
    const weakSubjects = subjectPerformance.filter((s) => s.accuracy < 60);

    if (weakSubjects.length === 0) {
      return {
        weak_topics: [],
        recommended_actions: ['Keep up the great work! Try challenging questions to improve further.'],
        confidence: 0.9,
        improvement_trend: 'stable',
      };
    }

    const prompt = `Student has weak performance in these subjects:
${JSON.stringify(weakSubjects)}

Identify specific weak topics and provide actionable recommendations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant identifying student weak areas.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async generateRecommendations(openai: any, subjectPerformance: any[], attempts: any[]) {
    const prompt = `Based on student performance across subjects, recommend quizzes and study materials:

Subject Performance: ${JSON.stringify(subjectPerformance)}
Recent Attempts: ${attempts.length}

Provide personalized recommendations for improvement.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant recommending learning resources.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async generateDailyTip(openai: any, data: any) {
    const tips = [
      'Practice makes perfect! Try solving 5 more questions today.',
      'Take short breaks while studying for better retention.',
      'Review your mistakes - they are the best learning opportunities.',
      'Teach what you learned to someone else to strengthen understanding.',
      'Start with difficult topics when your mind is fresh.',
    ];

    if (data.totalAttempts === 0) {
      return {
        tip: 'Welcome! Start with a quick quiz to get comfortable.',
        category: 'study',
        action_items: ['Take your first quiz', 'Explore different subjects'],
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant providing a daily study tip.',
        },
        {
          role: 'user',
          content: `Student has attempted ${data.totalAttempts} quizzes with avg score ${data.avgScore}. Give a motivational tip.`,
        },
      ],
      max_tokens: 150,
    });

    return {
      tip: response.choices[0].message.content,
      category: 'motivation',
      action_items: ['Apply this tip in your next study session'],
    };
  }

  private async generateStudyPlan(openai: any, subjectPerformance: any[], avgAccuracy: number) {
    const prompt = `Create a 30-day study plan for a student with:
Average Accuracy: ${avgAccuracy.toFixed(2)}%
Subject Performance: ${JSON.stringify(subjectPerformance)}

Include daily goals, focus areas, and milestones.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant creating a study plan.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Get user's AI insights
   */
  async getUserInsights(userId: string, type?: AIInsightType, limit: number = 10) {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as AIInsight[];
  }
}

export const aiService = new AIService();
