import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { supabase } from '../../../src/services/supabase';
import { lumina } from '../../../src/theme/lumina';

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
};

type QuizQuestion = {
  question_order: number;
  questions: Question;
};

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizConfig, setQuizConfig] = useState({ timePerQuestion: 30 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const posthog = usePostHog();

  useEffect(() => {
    fetchQuizData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(quizConfig.timePerQuestion);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return quizConfig.timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, loading]);

  const fetchQuizData = async () => {
    try {
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quizzes (
            id,
            time_per_question,
            quiz_questions (
              question_order,
              questions (
                id,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (attemptError) throw attemptError;
      const quiz = Array.isArray(attempt.quizzes) ? attempt.quizzes[0] : attempt.quizzes;
      if (!quiz) throw new Error('Quiz not found for this attempt');
      setQuizConfig({ timePerQuestion: quiz.time_per_question });
      setTimeLeft(quiz.time_per_question);

      const normalized: QuizQuestion[] = [...quiz.quiz_questions]
        .sort((a, b) => a.question_order - b.question_order)
        .map((qq) => ({
          question_order: qq.question_order,
          questions: Array.isArray(qq.questions) ? qq.questions[0] : qq.questions,
        }))
        .filter((q) => Boolean(q.questions));
      setQuestions(normalized);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    const question = questions[currentIndex].questions;
    setSelectedAnswer(option);
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    posthog.capture('quiz_answer_submitted', {
      attempt_id: id,
      question_id: question.id,
      question_number: currentIndex + 1,
      selected_option: option,
      is_correct: option === question.correct_option,
    });
  };

  const handlePreviousQuestion = () => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    const prevQuestion = questions[prevIndex].questions;
    setCurrentIndex(prevIndex);
    setSelectedAnswer(answers[prevQuestion.id] || null);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex].questions;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(answers[nextQuestion.id] || null);
      return;
    }
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const answerRecords = Object.entries(answers).map(([questionId, selectedOption]) => ({
        attempt_id: id,
        question_id: questionId,
        selected_option: selectedOption,
        answered_at: new Date().toISOString(),
      }));

      if (answerRecords.length > 0) {
        const { error: answersError } = await supabase.from('attempt_answers').insert(answerRecords);
        if (answersError) throw answersError;
      }

      const { data: result } = await supabase.functions.invoke('score-quiz', { body: { attempt_id: id } });
      posthog.capture('quiz_completed', {
        attempt_id: id,
        total_questions: questions.length,
        answered_questions: answerRecords.length,
        score: result?.score,
        correct_answers: result?.correct_answers,
      });
      router.replace(`/quiz/results/${id}`);
    } catch (error: any) {
      posthog.capture('$exception', {
        $exception_list: [{ type: 'QuizSubmitError', value: error.message || 'Failed to submit quiz' }],
        $exception_source: 'quiz_play_screen',
      });
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Your progress has been saved.');
      router.replace(`/quiz/results/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={lumina.colors.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No questions found</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex].questions;
  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d },
  ];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timerColor = timeLeft <= Math.max(5, Math.floor(quizConfig.timePerQuestion / 3))
    ? lumina.colors.danger
    : lumina.colors.secondaryContainer;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Gyan Path</Text>
        <View style={[styles.timer, { backgroundColor: timerColor }]}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      <Text style={styles.moduleLabel}>CURRENT MODULE</Text>
      <View style={styles.moduleRow}>
        <Text style={styles.moduleTitle}>Ancient Indian Economics</Text>
        <Text style={styles.counter}>Question {String(currentIndex + 1).padStart(2, '0')} / {questions.length}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
        <View style={styles.optionsWrap}>
          {options.map((option) => {
            const isSelected = selectedAnswer === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelectAnswer(option.key)}
                accessibilityLabel={`Option ${option.key}`}
              >
                <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                  <Text style={[styles.optionBadgeText, isSelected && styles.optionBadgeTextSelected]}>{option.key}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={styles.prevBtn} onPress={handlePreviousQuestion} accessibilityLabel="Previous question">
        <Text style={styles.prevBtnText}>← Previous Question</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.hintBtn}
        onPress={() => Alert.alert('Hint', 'Hint mode will be enabled from wallet coin system.')}
        accessibilityLabel="Use hint"
      >
        <Text style={styles.hintBtnText}>Use Hint (-5 Coins)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleNextQuestion} disabled={submitting} accessibilityLabel="Submit answer">
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>{currentIndex < questions.length - 1 ? 'Submit Answer →' : 'Finish Quiz →'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.surface, padding: 16, paddingTop: 56 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: lumina.colors.surface },
  errorText: { color: lumina.colors.danger, fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { color: lumina.colors.onSurface, fontSize: 22, fontWeight: '700' },
  timer: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  timerText: { color: '#fff', fontWeight: '700' },
  moduleLabel: { marginTop: 18, color: lumina.colors.onSurfaceVariant, fontSize: 11, fontWeight: '700' },
  moduleRow: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  moduleTitle: { flex: 1, color: lumina.colors.primary, fontSize: 28, fontWeight: '700' },
  counter: { color: lumina.colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  track: { marginTop: 14, height: 8, borderRadius: 999, backgroundColor: lumina.colors.tertiaryFixed, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: lumina.colors.tertiary },
  card: {
    marginTop: 24,
    backgroundColor: lumina.colors.surfaceLowest,
    borderRadius: lumina.radii.xl,
    padding: 20,
    ...lumina.shadows.ambient,
  },
  questionText: { color: lumina.colors.onSurface, fontSize: 20, lineHeight: 30, fontWeight: '600' },
  optionsWrap: { marginTop: 18, gap: 10 },
  option: {
    backgroundColor: lumina.colors.surfaceLow,
    borderRadius: lumina.radii.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionSelected: { backgroundColor: lumina.colors.primary },
  optionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lumina.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeSelected: { backgroundColor: '#ffffff20' },
  optionBadgeText: { color: lumina.colors.primary, fontWeight: '700' },
  optionBadgeTextSelected: { color: '#fff' },
  optionText: { flex: 1, color: lumina.colors.onSurface, fontSize: 14, fontWeight: '500' },
  optionTextSelected: { color: '#fff' },
  prevBtn: { marginTop: 24, alignItems: 'center' },
  prevBtnText: { color: lumina.colors.onSurfaceVariant, fontSize: 14, fontWeight: '600' },
  hintBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBtnText: { color: lumina.colors.primary, fontSize: 14, fontWeight: '600' },
  submitBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
