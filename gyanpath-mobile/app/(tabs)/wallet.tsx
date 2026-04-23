import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lumina } from '../../src/theme/lumina';

const TX = [
  { label: 'Daily Quiz', date: 'Oct 24, 2023', amount: '+50', credit: true },
  { label: 'Library Access', date: 'Oct 22, 2023', amount: '-200', credit: false },
  { label: 'Question Approved', date: 'Oct 21, 2023', amount: '+10', credit: true },
];

export default function WalletScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Luminous Academy</Text>
      <Text style={styles.headerCoins}>1,240 Coins</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.balance}>1,240</Text>
        <Text style={styles.balanceUnit}>Gyan Coins</Text>
        <View style={styles.inrPill}>
          <Text style={styles.inrText}>≈ ₹1,240.00 INR</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {['REDEEM', 'UPGRADE', 'REFER'].map((action) => (
          <TouchableOpacity key={action} style={styles.actionBtn} accessibilityLabel={action}>
            <Text style={styles.actionLabel}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.policy}>
        <Text style={styles.policyTitle}>Settlement Policy</Text>
        <Text style={styles.policyText}>
          Withdrawals are split: <Text style={styles.policyAccent}>70% to UPI</Text> and{' '}
          <Text style={styles.policyAccent}>30% to Wallet</Text>.
        </Text>
      </View>

      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      <View style={styles.txList}>
        {TX.map((item) => (
          <View key={`${item.label}-${item.date}`} style={styles.txRow}>
            <View style={styles.txIcon}>
              <Ionicons name={item.credit ? 'checkmark-done' : 'book'} size={18} color={lumina.colors.primary} />
            </View>
            <View style={styles.txMeta}>
              <Text style={styles.txLabel}>{item.label}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <Text style={[styles.txAmount, item.credit ? styles.credit : styles.debit]}>{item.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.darkSurface },
  content: { padding: 16, paddingBottom: 96 },
  header: { color: lumina.colors.darkOnSurface, fontSize: 18, fontWeight: '700' },
  headerCoins: { color: lumina.colors.primaryContainer, fontSize: 16, marginTop: 4, fontWeight: '600' },
  balanceCard: {
    marginTop: 18,
    borderRadius: lumina.radii.xl,
    padding: 22,
    backgroundColor: lumina.colors.primary,
  },
  balanceLabel: { color: '#d6deff', fontSize: 11, fontWeight: '700' },
  balance: { color: '#fff', fontSize: 42, fontWeight: '700', marginTop: 8 },
  balanceUnit: { color: '#fff', fontSize: 16, marginTop: 2 },
  inrPill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  inrText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actions: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: {
    width: '31%',
    height: 64,
    borderRadius: 16,
    backgroundColor: lumina.colors.darkSurfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: lumina.colors.darkOnSurface, fontSize: 11, fontWeight: '700' },
  policy: {
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: lumina.colors.darkSurfaceLow,
    padding: 14,
  },
  policyTitle: { color: lumina.colors.darkOnSurface, fontSize: 14, fontWeight: '700' },
  policyText: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 12, marginTop: 5, lineHeight: 18 },
  policyAccent: { color: lumina.colors.secondaryContainer, fontWeight: '700' },
  activityHeader: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityTitle: { color: lumina.colors.darkOnSurface, fontSize: 20, fontWeight: '700' },
  viewAll: { color: lumina.colors.primaryContainer, fontWeight: '600', fontSize: 12 },
  txList: { marginTop: 14, gap: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lumina.colors.darkSurfaceLow,
  },
  txMeta: { flex: 1, marginLeft: 12 },
  txLabel: { color: lumina.colors.darkOnSurface, fontSize: 14, fontWeight: '600' },
  txDate: { color: lumina.colors.darkOnSurfaceVariant, fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  credit: { color: lumina.colors.tertiaryFixed },
  debit: { color: lumina.colors.danger },
});
