import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { supabase } from '../../src/services/supabase';

type AIInsight = {
  id: string;
  insight_type: string;
  content: string;
  created_at: string;
  metadata: {
    subject?: string;
    weak_topics?: string[];
    strong_topics?: string[];
    recommended_actions?: string[];
  };
};

export default function AIInsightsScreen() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsight = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insight', {
        body: { insight_type: 'performance_analysis' },
      });

      if (error) throw error;

      posthog.capture('ai_insight_generated', {
        insight_type: 'performance_analysis',
      });

      // Refresh insights
      await fetchInsights();
    } catch (error: any) {
      posthog.capture('$exception', {
        $exception_list: [
          {
            type: 'AIInsightError',
            value: error.message || 'Failed to generate insight',
          },
        ],
        $exception_source: 'ai_insights_screen',
      });
      console.error('Error generating insight:', error);
      alert('Failed to generate insight. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance_analysis': return '📊';
      case 'weak_areas': return '🎯';
      case 'study_recommendation': return '📚';
      case 'streak_motivation': return '🔥';
      default: return '💡';
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'performance_analysis': return 'Performance Analysis';
      case 'weak_areas': return 'Areas to Improve';
      case 'study_recommendation': return 'Study Recommendations';
      case 'streak_motivation': return 'Keep Going!';
      default: return 'AI Insight';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>Personalized learning recommendations</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateNewInsight}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.generateIcon}>🤖</Text>
              <Text style={styles.generateText}>Generate New Insight</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Insights List */}
        {insights.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptyText}>
              Complete some quizzes and we&apos;ll analyze your performance to provide personalized insights.
            </Text>
          </View>
        ) : (
          insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{getInsightIcon(insight.insight_type)}</Text>
                <View style={styles.insightTitleContainer}>
                  <Text style={styles.insightTitle}>{getInsightTitle(insight.insight_type)}</Text>
                  <Text style={styles.insightDate}>
                    {new Date(insight.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.insightContent}>{insight.content}</Text>

              {insight.metadata?.weak_topics && insight.metadata.weak_topics.length > 0 && (
                <View style={styles.topicsContainer}>
                  <Text style={styles.topicsLabel}>Focus areas:</Text>
                  <View style={styles.topicsList}>
                    {insight.metadata.weak_topics.map((topic, index) => (
                      <View key={index} style={styles.topicTag}>
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {insight.metadata?.recommended_actions && insight.metadata.recommended_actions.length > 0 && (
                <View style={styles.actionsContainer}>
                  <Text style={styles.actionsLabel}>Recommended actions:</Text>
                  {insight.metadata.recommended_actions.map((action, index) => (
                    <View key={index} style={styles.actionItem}>
                      <Text style={styles.actionBullet}>•</Text>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6366f1',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#e0e7ff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  generateIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  insightContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  topicsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  topicsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  actionBullet: {
    fontSize: 14,
    color: '#6366f1',
    marginRight: 8,
    fontWeight: 'bold',
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
});
