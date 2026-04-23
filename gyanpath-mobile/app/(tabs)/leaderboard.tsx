import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { lumina } from '../../src/theme/lumina';

export default function BattleArenaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Arena</Text>
        <Text style={styles.coins}>1,240</Text>
      </View>

      <View style={styles.subjectChip}>
        <Text style={styles.subjectText}>⚗️ Quantum Physics</Text>
      </View>

      <View style={styles.vsRow}>
        <View style={styles.playerCard}>
          <Text style={styles.avatar}>🙂</Text>
          <Text style={styles.playerName}>YOU</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.playerCard}>
          <Text style={styles.avatar}>?</Text>
          <Text style={styles.playerName}>Searching...</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View>
          <Text style={styles.statLabel}>ENTRY FEE</Text>
          <Text style={styles.statValue}>50</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>WINNING PRIZE</Text>
          <Text style={styles.statValue}>90</Text>
        </View>
      </View>

      <Text style={styles.scan}>Scanning for expert rivals 00:14</Text>
      <View style={styles.track}>
        <View style={styles.fill} />
      </View>

      <TouchableOpacity style={styles.cancelBtn} accessibilityLabel="Cancel matchmaking">
        <Text style={styles.cancelText}>✕ Cancel Matchmaking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.darkSurface, padding: 16, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: lumina.colors.darkOnSurface, fontSize: 22 },
  headerTitle: { color: lumina.colors.darkOnSurface, fontSize: 22, fontWeight: '700' },
  coins: { color: lumina.colors.primaryContainer, fontSize: 14, fontWeight: '700' },
  subjectChip: {
    marginTop: 28,
    alignSelf: 'center',
    backgroundColor: lumina.colors.secondaryContainer,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  subjectText: { color: lumina.colors.onSecondaryContainer, fontWeight: '700', fontSize: 12 },
  vsRow: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerCard: {
    width: 130,
    height: 160,
    borderRadius: 20,
    backgroundColor: lumina.colors.darkSurfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  avatar: { color: lumina.colors.darkOnSurface, fontSize: 34 },
  playerName: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 12, fontWeight: '600' },
  vs: { color: lumina.colors.primaryContainer, fontSize: 30, fontWeight: '700' },
  stats: {
    marginTop: 28,
    backgroundColor: lumina.colors.darkSurfaceLow,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 10, fontWeight: '700' },
  statValue: { color: lumina.colors.darkOnSurface, fontSize: 26, fontWeight: '700', marginTop: 6 },
  scan: { marginTop: 24, color: lumina.colors.darkOnSurfaceVariant, fontSize: 12, textAlign: 'center' },
  track: { marginTop: 10, height: 8, borderRadius: 999, backgroundColor: lumina.colors.darkSurfaceHigh },
  fill: { width: '66%', height: 8, borderRadius: 999, backgroundColor: lumina.colors.primaryContainer },
  cancelBtn: { marginTop: 28, alignItems: 'center' },
  cancelText: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 14, fontWeight: '600' },
});
