import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { lumina } from '../../src/theme/lumina';

const SUBJECTS = ['Mathematics', 'Science', 'Economics', 'English'];

export default function MaterialsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>The Scholar</Text>
      <Text style={styles.title}>Digital Library</Text>
      <Text style={styles.subtitle}>Curated wisdom for your academic journey.</Text>

      <TextInput
        placeholder="Find books, notes, or exam papers..."
        placeholderTextColor={lumina.colors.darkOnSurfaceVariant}
        style={styles.search}
        accessibilityLabel="Search library"
      />

      <View style={styles.tracker}>
        <Text style={styles.liveChip}>LIVE PROGRESS</Text>
        <Text style={styles.trackerTitle}>My Study Tracker</Text>
        <Text style={styles.trackerBody}>You&apos;ve reached 82% of your weekly goal.</Text>
        <View style={styles.trackerStats}>
          <View>
            <Text style={styles.trackerMetric}>3</Text>
            <Text style={styles.trackerMetricLabel}>Books in progress</Text>
          </View>
          <View>
            <Text style={styles.trackerMetric}>45</Text>
            <Text style={styles.trackerMetricLabel}>Pages read today</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Reads</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {['Quantum Mechanics', 'The Wealth of Nations', 'Macroeconomic Principles'].map((book) => (
          <View key={book} style={styles.bookCard}>
            <View style={styles.bookCover} />
            <Text style={styles.bookTitle} numberOfLines={1}>
              {book}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Subject Categories</Text>
      <View style={styles.grid}>
        {SUBJECTS.map((subject) => (
          <TouchableOpacity key={subject} style={styles.subjectCard} accessibilityLabel={subject}>
            <Text style={styles.subjectEmoji}>📘</Text>
            <Text style={styles.subjectText}>{subject}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.darkSurface },
  content: { padding: 16, paddingBottom: 96 },
  brand: { color: lumina.colors.darkOnSurface, fontSize: 16, fontWeight: '700' },
  title: { color: lumina.colors.darkOnSurface, fontSize: 34, fontWeight: '700', marginTop: 10 },
  subtitle: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 14, marginTop: 6 },
  search: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: lumina.colors.darkSurfaceLow,
    color: lumina.colors.darkOnSurface,
    paddingHorizontal: 16,
  },
  tracker: {
    marginTop: 24,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.darkSurfaceHigh,
    padding: 20,
  },
  liveChip: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: lumina.colors.secondaryContainer,
    color: '#653900',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '700',
  },
  trackerTitle: { color: lumina.colors.darkOnSurface, fontSize: 20, fontWeight: '700', marginTop: 10 },
  trackerBody: { color: lumina.colors.darkOnSurfaceVariant, marginTop: 8, fontSize: 13 },
  trackerStats: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  trackerMetric: { color: '#7ea8ff', fontSize: 28, fontWeight: '700' },
  trackerMetricLabel: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 12 },
  sectionTitle: { marginTop: 28, color: lumina.colors.darkOnSurface, fontSize: 22, fontWeight: '700' },
  row: { gap: 12, marginTop: 12 },
  bookCard: { width: 160 },
  bookCover: { height: 220, borderRadius: 16, backgroundColor: '#273041' },
  bookTitle: { marginTop: 10, color: lumina.colors.darkOnSurface, fontSize: 13, fontWeight: '600' },
  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subjectCard: {
    width: '47%',
    backgroundColor: lumina.colors.darkSurfaceLow,
    borderRadius: lumina.radii.xl,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectEmoji: { fontSize: 26, marginBottom: 8 },
  subjectText: { color: lumina.colors.darkOnSurface, fontSize: 14, fontWeight: '600' },
});
