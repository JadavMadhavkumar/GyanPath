import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lumina } from '../../src/theme/lumina';

const QUIZ_MODES = [
  { id: 'normal', title: 'Normal Quiz', meta: '10 questions · 30 seconds each' },
  { id: 'fast', title: 'Fast Quiz', meta: '20 questions · 15 seconds each' },
];

export default function QuizScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>CURRENT MODULE</Text>
      <Text style={styles.title}>Ancient Indian Economics</Text>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <View style={styles.progressMeta}>
        <Text style={styles.progressText}>QUESTION 05 / 10</Text>
        <Text style={styles.progressText}>50% DONE</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose Quiz Mode</Text>
        <Text style={styles.cardSub}>Select how you want to practice</Text>
        {QUIZ_MODES.map((mode) => (
          <Link key={mode.id} href={`/quiz/${mode.id}` as const} asChild>
            <TouchableOpacity style={styles.modeBtn} accessibilityLabel={mode.title}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeMeta}>{mode.meta}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      <Link href="/(tabs)/leaderboard" asChild>
        <TouchableOpacity style={styles.battleCard} accessibilityLabel="Open battle arena">
          <Text style={styles.battleChip}>BATTLE ARENA</Text>
          <Text style={styles.battleTitle}>Match with top rivals in real time</Text>
          <Text style={styles.battleCta}>Start Matchmaking →</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.surface },
  content: { padding: 16, paddingBottom: 96 },
  label: { color: lumina.colors.onSurfaceVariant, fontSize: 11, fontWeight: '700' },
  title: { color: lumina.colors.primary, fontSize: 30, fontWeight: '700', marginTop: 4 },
  progressTrack: { marginTop: 16, height: 8, borderRadius: 999, backgroundColor: lumina.colors.tertiaryFixed },
  progressFill: { width: '50%', height: 8, borderRadius: 999, backgroundColor: lumina.colors.tertiary },
  progressMeta: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: lumina.colors.onSurfaceVariant, fontSize: 11, fontWeight: '600' },
  card: {
    marginTop: 24,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.surfaceLowest,
    padding: 20,
    ...lumina.shadows.ambient,
  },
  cardTitle: { color: lumina.colors.onSurface, fontSize: 22, fontWeight: '700' },
  cardSub: { color: lumina.colors.onSurfaceVariant, marginTop: 6, marginBottom: 14, fontSize: 13 },
  modeBtn: {
    borderRadius: 16,
    backgroundColor: lumina.colors.surfaceLow,
    padding: 14,
    marginBottom: 10,
  },
  modeTitle: { color: lumina.colors.onSurface, fontSize: 16, fontWeight: '700' },
  modeMeta: { color: lumina.colors.onSurfaceVariant, marginTop: 4, fontSize: 12 },
  battleCard: {
    marginTop: 18,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.darkSurface,
    padding: 20,
  },
  battleChip: {
    alignSelf: 'flex-start',
    color: lumina.colors.onSecondaryContainer,
    backgroundColor: lumina.colors.secondaryContainer,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '700',
  },
  battleTitle: { marginTop: 12, color: lumina.colors.darkOnSurface, fontSize: 18, fontWeight: '700' },
  battleCta: { marginTop: 10, color: lumina.colors.primaryContainer, fontSize: 14, fontWeight: '700' },
});
