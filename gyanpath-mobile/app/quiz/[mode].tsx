import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { supabase } from '../../src/services/supabase';
import { lumina } from '../../src/theme/lumina';

type Subject = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  question_count?: number;
};

type QuizMode = 'normal' | 'fast' | 'rapid_fire' | 'extended';

const MODE_CONFIG: Record<QuizMode, { title: string; description: string; questionCount: number; timePerQuestion: number }> = {
  normal: {
    title: 'Normal Quiz',
    description: '10 questions, 30 seconds each',
    questionCount: 10,
    timePerQuestion: 30,
  },
  fast: {
    title: 'Fast Quiz',
    description: '20 questions, 15 seconds each',
    questionCount: 20,
    timePerQuestion: 15,
  },
  rapid_fire: {
    title: 'Rapid Fire',
    description: '50 questions, 10 seconds each',
    questionCount: 50,
    timePerQuestion: 10,
  },
  extended: {
    title: 'Extended Quiz',
    description: '30 questions, 60 seconds each',
    questionCount: 30,
    timePerQuestion: 60,
  },
};

export default function QuizModeScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const quizMode = (mode as QuizMode) || 'normal';
  const config = MODE_CONFIG[quizMode] || MODE_CONFIG.normal;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, description, icon_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!selectedSubject) return;
    
    setStarting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      // Create quiz attempt
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          subject_id: selectedSubject,
          mode: quizMode,
          question_count: config.questionCount,
          time_per_question: config.timePerQuestion,
          created_by: user.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Get random questions for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('subject_id', selectedSubject)
        .eq('status', 'approved')
        .limit(config.questionCount);

      if (questionsError) throw questionsError;

      if (!questions || questions.length < config.questionCount) {
        alert(`Not enough questions available. Need ${config.questionCount}, found ${questions?.length || 0}`);
        setStarting(false);
        return;
      }

      // Insert quiz questions
      const quizQuestions = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_id: q.id,
        question_order: index + 1,
      }));

      const { error: insertError } = await supabase
        .from('quiz_questions')
        .insert(quizQuestions);

      if (insertError) throw insertError;

      // Create quiz attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      const subjectName = subjects.find((s) => s.id === selectedSubject)?.name ?? null;
      posthog.capture('quiz_started', {
        quiz_id: quiz.id,
        attempt_id: attempt.id,
        mode: quizMode,
        subject_id: selectedSubject,
        subject_name: subjectName,
        question_count: config.questionCount,
        time_per_question: config.timePerQuestion,
      });

      // Navigate to play screen
      router.push(`/quiz/play/${attempt.id}`);
    } catch (error: any) {
      posthog.capture('$exception', {
        $exception_list: [
          {
            type: 'QuizStartError',
            value: error.message || 'Failed to start quiz',
          },
        ],
        $exception_source: 'quiz_mode_screen',
        mode: quizMode,
      });
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={[
        styles.subjectCard,
        selectedSubject === item.id && styles.subjectCardSelected,
      ]}
      onPress={() => setSelectedSubject(item.id)}
    >
      <View style={styles.subjectIcon}>
        <Text style={styles.subjectIconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.subjectDesc} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      {selectedSubject === item.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lumina.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Subject</Text>
        
        <FlatList
          data={subjects}
          renderItem={renderSubject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subjectList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects available</Text>
          }
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedSubject && styles.startButtonDisabled]}
          onPress={startQuiz}
          disabled={!selectedSubject || starting}
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>Start Quiz</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lumina.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: lumina.colors.primary,
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
  description: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lumina.colors.onSurface,
    marginBottom: 12,
  },
  subjectList: {
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lumina.colors.surfaceLowest,
    padding: 16,
    borderRadius: lumina.radii.lg,
    marginBottom: 8,
  },
  subjectCardSelected: {
    backgroundColor: lumina.colors.surfaceHigh,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lumina.colors.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lumina.colors.primary,
  },
  subjectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: lumina.colors.onSurface,
  },
  subjectDesc: {
    fontSize: 13,
    color: lumina.colors.onSurfaceVariant,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: lumina.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: lumina.colors.onSurfaceVariant,
    marginTop: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: lumina.colors.surfaceLowest,
  },
  startButton: {
    backgroundColor: lumina.colors.primary,
    padding: 16,
    borderRadius: lumina.radii.xl,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: lumina.colors.primaryContainer,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
