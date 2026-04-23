import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { supabase } from '../../../src/services/supabase';

type AttemptResult = {
  id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  coins_earned: number;
  xp_earned: number;
  completed_at: string;
  quizzes: {
    mode: string;
    question_count: number;
    subjects: {
      name: string;
    } | {
      name: string;
    }[] | null;
  } | {
    mode: string;
    question_count: number;
    subjects: {
      name: string;
    } | {
      name: string;
    }[] | null;
  }[] | null;
};

export default function QuizResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const posthog = usePostHog();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          correct_answers,
          wrong_answers,
          coins_earned,
          xp_earned,
          completed_at,
          quizzes (
            mode,
            question_count,
            subjects (
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setResult(data);

      const quiz = Array.isArray(data.quizzes) ? data.quizzes[0] : data.quizzes;
      const subject = quiz ? (Array.isArray(quiz.subjects) ? quiz.subjects[0] : quiz.subjects) : null;
      const totalQuestions = quiz?.question_count ?? 0;
      const percentage = totalQuestions > 0 ? Math.round((data.correct_answers / totalQuestions) * 100) : 0;
      posthog.capture('quiz_results_viewed', {
        attempt_id: id,
        score: data.score,
        percentage,
        correct_answers: data.correct_answers,
        wrong_answers: data.wrong_answers,
        coins_earned: data.coins_earned,
        xp_earned: data.xp_earned,
        mode: quiz?.mode,
        subject_name: subject?.name,
      });
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Results not found</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/quiz')} style={styles.button}>
          <Text style={styles.buttonText}>Back to Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const quiz = Array.isArray(result.quizzes) ? result.quizzes[0] : result.quizzes;
  if (!quiz) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Quiz details not found</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/quiz')} style={styles.button}>
          <Text style={styles.buttonText}>Back to Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subject = Array.isArray(quiz.subjects) ? quiz.subjects[0] : quiz.subjects;
  const totalQuestions = quiz.question_count;
  const percentage = Math.round((result.correct_answers / totalQuestions) * 100);
  const isPassing = percentage >= 60;

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', message: 'Excellent!' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981', message: 'Great job!' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6', message: 'Good work!' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b', message: 'Keep practicing!' };
    if (percentage >= 50) return { grade: 'D', color: '#f97316', message: 'Need improvement' };
    return { grade: 'F', color: '#ef4444', message: 'Try again!' };
  };

  const gradeInfo = getGrade();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isPassing ? '#10b981' : '#ef4444' }]}>
        <Text style={styles.headerTitle}>Quiz Complete!</Text>
        <Text style={styles.headerSubtitle}>
          {subject?.name || 'Unknown Subject'} - {quiz.mode.charAt(0).toUpperCase() + quiz.mode.slice(1)}
        </Text>
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <View style={[styles.gradeCircle, { borderColor: gradeInfo.color }]}>
          <Text style={[styles.gradeText, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
        </View>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.gradeMessage}>{gradeInfo.message}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{result.correct_answers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{result.wrong_answers}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#6b7280' }]}>
            {totalQuestions - result.correct_answers - result.wrong_answers}
          </Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.rewardsCard}>
        <Text style={styles.rewardsTitle}>Rewards Earned</Text>
        <View style={styles.rewardsRow}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>🪙</Text>
            <Text style={styles.rewardValue}>+{result.coins_earned || 0}</Text>
            <Text style={styles.rewardLabel}>Coins</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardValue}>+{result.xp_earned || 0}</Text>
            <Text style={styles.rewardLabel}>XP</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/quiz')}
        >
          <Text style={styles.primaryButtonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.secondaryButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>

      {/* Share */}
      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareButtonText}>📤 Share Results</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 70,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  scoreCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  gradeMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  rewardsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 12,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 28,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
    marginTop: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#92400e',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    marginHorizontal: 16,
    padding: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '500',
  },
});
