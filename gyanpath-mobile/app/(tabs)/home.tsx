import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { lumina } from '../../src/theme/lumina';

const PATHWAYS = [
  { label: 'Daily Quiz', icon: 'help-circle', href: '/(tabs)/quiz' as const },
  { label: 'Library', icon: 'book', href: '/(tabs)/materials' as const },
  { label: 'Assistant', icon: 'chatbubble-ellipses', href: '/(tabs)/assistant' as const },
  { label: 'Wallet', icon: 'wallet', href: '/(tabs)/wallet' as const },
  { label: 'Admissions', icon: 'school', href: '/(tabs)/home' as const },
  { label: 'Jobs', icon: 'briefcase', href: '/(tabs)/home' as const },
] as const satisfies readonly {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: '/(tabs)/quiz' | '/(tabs)/materials' | '/(tabs)/assistant' | '/(tabs)/wallet' | '/(tabs)/home';
}[];

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const name = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Gyan Path</Text>
        <View style={styles.coinChip}>
          <Ionicons name="wallet" size={14} color={lumina.colors.secondary} />
          <Text style={styles.coinChipText}>1,250</Text>
        </View>
      </View>

      <Text style={styles.greeting}>Namaste, {name}</Text>
      <Text style={styles.subline}>Your editorial journey through knowledge continues.</Text>

      <View style={styles.hero}>
        <View style={styles.recommendChip}>
          <Text style={styles.recommendChipText}>RECOMMENDED</Text>
        </View>
        <Text style={styles.heroTitle}>Foundations of Quantum Physics</Text>
        <Text style={styles.heroDescription}>Master paradoxes of the subatomic world.</Text>
        <TouchableOpacity style={styles.heroCta} accessibilityLabel="Resume learning">
          <Text style={styles.heroCtaText}>Resume Learning</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Daily Streak</Text>
        <Text style={styles.streakCount}>12/15</Text>
        <Text style={styles.streakDesc}>Complete today&apos;s quiz to earn 50 Gyan Coins.</Text>
      </View>

      <Text style={styles.sectionTitle}>Pathways</Text>
      <View style={styles.grid}>
        {PATHWAYS.map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <TouchableOpacity style={styles.gridCard} accessibilityLabel={item.label}>
              <View style={styles.gridIconWrap}>
                <Ionicons name={item.icon} size={24} color={lumina.colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Monthly Learning Progress</Text>
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>18 MODULES DONE</Text>
          <Text style={styles.progressText}>6 REMAINING</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.reportBtn} accessibilityLabel="Generate report">
        <Text style={styles.reportBtnText}>Generate Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.surface },
  content: { padding: 16, paddingBottom: 96 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: lumina.colors.onSurface, letterSpacing: -0.3 },
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: lumina.colors.surfaceHigh,
  },
  coinChipText: { color: lumina.colors.primary, fontWeight: '700', fontSize: 13 },
  greeting: { fontSize: 34, fontWeight: '700', color: lumina.colors.onSurface, letterSpacing: -0.6 },
  subline: { marginTop: 6, fontSize: 14, color: lumina.colors.onSurfaceVariant },
  hero: {
    marginTop: 24,
    borderRadius: lumina.radii.xl,
    padding: 24,
    backgroundColor: lumina.colors.primaryContainer,
    ...lumina.shadows.ambient,
  },
  recommendChip: {
    alignSelf: 'flex-start',
    backgroundColor: lumina.colors.surfaceHigh,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recommendChipText: { fontSize: 11, color: lumina.colors.primary, fontWeight: '700' },
  heroTitle: { marginTop: 12, color: '#fff', fontSize: 26, fontWeight: '700' },
  heroDescription: { marginTop: 8, color: '#eef1fb', fontSize: 14 },
  heroCta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroCtaText: { color: lumina.colors.primary, fontWeight: '600' },
  streakCard: {
    marginTop: 24,
    borderRadius: lumina.radii.xl,
    padding: 20,
    backgroundColor: lumina.colors.surfaceLowest,
    borderLeftWidth: 4,
    borderLeftColor: lumina.colors.secondaryContainer,
  },
  streakTitle: { color: lumina.colors.onSurface, fontSize: 18, fontWeight: '700' },
  streakCount: { color: lumina.colors.secondary, fontSize: 30, fontWeight: '700', marginTop: 8 },
  streakDesc: { color: lumina.colors.onSurfaceVariant, fontSize: 12, marginTop: 8 },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 12,
    color: lumina.colors.onSurface,
    fontSize: 22,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: {
    width: '31.5%',
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: lumina.colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lumina.colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: { color: lumina.colors.onSurface, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  progressWrap: {
    marginTop: 6,
    borderRadius: 16,
    padding: 16,
    backgroundColor: lumina.colors.surfaceLow,
  },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: lumina.colors.tertiaryFixed, overflow: 'hidden' },
  progressFill: { width: '75%', height: 8, backgroundColor: lumina.colors.tertiary, borderRadius: 999 },
  progressLabels: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 11, color: lumina.colors.onSurfaceVariant, fontWeight: '600' },
  reportBtn: {
    marginTop: 16,
    backgroundColor: lumina.colors.primary,
    borderRadius: lumina.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  reportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
