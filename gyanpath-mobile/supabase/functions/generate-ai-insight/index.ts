// Supabase Edge Function: Generate AI Insight
// Uses OpenAI to analyze user performance and generate personalized insights

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  insight_type: 'performance_analysis' | 'weak_areas' | 'study_recommendation' | 'streak_motivation';
  subject_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) throw new Error('Invalid authentication');

    const { insight_type, subject_id }: InsightRequest = await req.json();

    // Check for cached insight (within 24 hours)
    const { data: cachedInsight } = await supabaseClient
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('insight_type', insight_type)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedInsight) {
      return new Response(
        JSON.stringify({ success: true, insight: cachedInsight, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Gather user performance data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get recent quiz attempts
    const { data: attempts } = await supabaseClient
      .from('quiz_attempts')
      .select(`
        score,
        correct_answers,
        wrong_answers,
        completed_at,
        quizzes (
          mode,
          subjects (name)
        )
      `)
      .eq('user_id', user.id)
      .gte('completed_at', thirtyDaysAgo)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(50);

    // Get user streak
    const { data: streak } = await supabaseClient
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('users')
      .select('display_name, total_xp')
      .eq('id', user.id)
      .single();

    // Calculate performance metrics
    const totalAttempts = attempts?.length || 0;
    const avgScore = totalAttempts > 0
      ? Math.round(attempts!.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;

    // Subject breakdown
    const subjectPerformance: Record<string, { total: number; correct: number }> = {};
    for (const attempt of attempts || []) {
      const subject = attempt.quizzes?.subjects?.name || 'Unknown';
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { total: 0, correct: 0 };
      }
      subjectPerformance[subject].total += (attempt.correct_answers || 0) + (attempt.wrong_answers || 0);
      subjectPerformance[subject].correct += attempt.correct_answers || 0;
    }

    // Find weak and strong subjects
    const subjectScores = Object.entries(subjectPerformance)
      .map(([name, data]) => ({
        name,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        questions: data.total,
      }))
      .filter(s => s.questions >= 5)
      .sort((a, b) => a.accuracy - b.accuracy);

    const weakSubjects = subjectScores.slice(0, 2).filter(s => s.accuracy < 70);
    const strongSubjects = subjectScores.slice(-2).filter(s => s.accuracy >= 70);

    // Build prompt for OpenAI
    const prompt = buildPrompt(insight_type, {
      name: profile?.display_name || 'Student',
      totalAttempts,
      avgScore,
      streak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalXp: profile?.total_xp || 0,
      weakSubjects,
      strongSubjects,
    });

    // Call OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    let content: string;
    let metadata: any = {};

    if (openaiKey) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful educational assistant. Provide encouraging, actionable insights in 2-3 sentences. Be specific but concise. Use Hindi-English mix if appropriate for Indian students.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      const openaiData = await openaiResponse.json();
      content = openaiData.choices?.[0]?.message?.content || generateFallbackInsight(insight_type, avgScore);
    } else {
      // Fallback without OpenAI
      content = generateFallbackInsight(insight_type, avgScore);
    }

    // Build metadata
    metadata = {
      weak_topics: weakSubjects.map(s => s.name),
      strong_topics: strongSubjects.map(s => s.name),
      recommended_actions: getRecommendedActions(insight_type, weakSubjects),
    };

    // Save insight
    const { data: newInsight, error: insertError } = await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type,
        content,
        metadata,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, insight: newInsight, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});

function buildPrompt(type: string, data: any): string {
  switch (type) {
    case 'performance_analysis':
      return `Analyze this student's quiz performance:
Name: ${data.name}
Quizzes completed (30 days): ${data.totalAttempts}
Average score: ${data.avgScore}%
Current streak: ${data.streak} days
Total XP: ${data.totalXp}
Weak areas: ${data.weakSubjects.map((s: any) => `${s.name} (${s.accuracy}%)`).join(', ') || 'None identified'}
Strong areas: ${data.strongSubjects.map((s: any) => `${s.name} (${s.accuracy}%)`).join(', ') || 'None identified'}

Give a brief, encouraging performance summary with one specific tip for improvement.`;

    case 'weak_areas':
      return `Student ${data.name} needs help with these subjects:
${data.weakSubjects.map((s: any) => `- ${s.name}: ${s.accuracy}% accuracy`).join('\n') || 'No specific weak areas identified'}

Suggest 2-3 specific study strategies to improve in these areas.`;

    case 'study_recommendation':
      return `Create a brief study plan for student ${data.name}:
- Average quiz score: ${data.avgScore}%
- Current streak: ${data.streak} days
- Weak subjects: ${data.weakSubjects.map((s: any) => s.name).join(', ') || 'None'}

Suggest what they should focus on this week.`;

    case 'streak_motivation':
      return `Student ${data.name} has a ${data.streak}-day learning streak (longest: ${data.longestStreak}).
Write a short motivational message to keep them going. Be encouraging!`;

    default:
      return `Give a brief learning tip for a student with ${data.avgScore}% average quiz score.`;
  }
}

function generateFallbackInsight(type: string, avgScore: number): string {
  const insights: Record<string, string> = {
    performance_analysis: avgScore >= 70
      ? `Great progress! Your ${avgScore}% average shows solid understanding. Focus on maintaining consistency and challenging yourself with harder quiz modes.`
      : `You're making progress with a ${avgScore}% average. Try reviewing missed questions after each quiz and practice daily for best results.`,
    weak_areas: 'Focus on your challenging subjects by taking more practice quizzes. Review explanations for questions you miss and try again!',
    study_recommendation: 'Aim for at least 2 quizzes daily. Start with your weakest subject, then reinforce with a quiz in your strongest area.',
    streak_motivation: 'Keep up your learning streak! Every day you practice, your knowledge grows stronger. You\'ve got this! 🎯',
  };
  return insights[type] || insights.performance_analysis;
}

function getRecommendedActions(type: string, weakSubjects: any[]): string[] {
  const actions: string[] = [];
  
  if (weakSubjects.length > 0) {
    actions.push(`Practice more ${weakSubjects[0].name} quizzes`);
  }
  
  actions.push('Complete at least one quiz daily');
  actions.push('Review explanations for wrong answers');
  
  if (type === 'study_recommendation') {
    actions.push('Try the Fast Quiz mode for quick revision');
  }
  
  return actions;
}
