import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lumina } from '../../src/theme/lumina';

type Language = {
  id: string;
  title: string;
  subtitle: string;
};

const LANGUAGES: Language[] = [
  { id: 'en', title: 'English', subtitle: 'Standard Academic' },
  { id: 'hi', title: 'हिन्दी', subtitle: 'Hindi Medium' },
  { id: 'bn', title: 'বাংলা', subtitle: 'Bengali Path' },
  { id: 'mr', title: 'मराठी', subtitle: 'Marathi Medium' },
];

export default function OnboardingScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const selected = useMemo(() => LANGUAGES.find((item) => item.id === selectedLanguage), [selectedLanguage]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBrand}>
            <Ionicons name="book" size={28} color={lumina.colors.tertiaryFixed} />
            <Text style={styles.heroBrandText}>Gyan Path</Text>
          </View>
          <Text style={styles.heroTitle}>Your Digital Journey to Wisdom Starts Here.</Text>
          <Text style={styles.heroSub}>
            Experience editorial-grade learning designed to adapt to your unique educational pace.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.greeting}>Namaste.</Text>
          <Text style={styles.greetingSub}>Select your preferred learning path to begin.</Text>

          <Text style={styles.sectionLabel}>CHOOSE LANGUAGE</Text>
          <View style={styles.grid}>
            {LANGUAGES.map((item) => {
              const isSelected = selectedLanguage === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedLanguage(item.id)}
                  style={[styles.option, isSelected ? styles.optionSelected : styles.optionIdle]}
                  accessibilityLabel={`Language ${item.title}`}
                >
                  <View>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{item.title}</Text>
                    <Text style={styles.optionSub}>{item.subtitle}</Text>
                  </View>
                  {isSelected ? (
                    <View style={styles.selectedIcon}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={lumina.colors.onSurfaceVariant} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.cta}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityLabel="Get started"
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          <View style={styles.policyCard}>
            <Ionicons name="trophy" size={18} color={lumina.colors.onSecondaryContainer} />
            <View style={styles.policyTextWrap}>
              <Text style={styles.policyTitle}>Start earning Gyan Coins</Text>
              <Text style={styles.policyText}>
                Selected: {selected?.title}. Complete your profile to claim your first 50 coins.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: lumina.colors.surface },
  container: { flex: 1, backgroundColor: lumina.colors.surface },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  hero: {
    borderRadius: 32,
    backgroundColor: lumina.colors.primaryContainer,
    padding: 24,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  heroBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroBrandText: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  heroTitle: { marginTop: 20, color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.6, lineHeight: 38 },
  heroSub: { marginTop: 8, color: '#e6ebff', fontSize: 14, lineHeight: 20 },
  form: { paddingVertical: 8 },
  greeting: { color: lumina.colors.primary, fontSize: 36, fontWeight: '800', letterSpacing: -0.6 },
  greetingSub: { marginTop: 4, color: lumina.colors.onSurfaceVariant, fontSize: 15 },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 10,
    color: lumina.colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  grid: { gap: 10 },
  option: {
    borderRadius: lumina.radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionIdle: { backgroundColor: lumina.colors.surfaceLow },
  optionSelected: { backgroundColor: lumina.colors.surfaceLowest, borderWidth: 2, borderColor: lumina.colors.primary },
  optionTitle: { color: lumina.colors.onSurface, fontSize: 20, fontWeight: '700' },
  optionTitleSelected: { color: lumina.colors.primary },
  optionSub: { marginTop: 2, color: lumina.colors.onSurfaceVariant, fontSize: 12, fontWeight: '500' },
  selectedIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: lumina.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    marginTop: 20,
    height: 54,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  policyCard: {
    marginTop: 16,
    borderRadius: lumina.radii.xl,
    backgroundColor: lumina.colors.surfaceHigh,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  policyTextWrap: { flex: 1 },
  policyTitle: { color: lumina.colors.secondary, fontSize: 14, fontWeight: '700' },
  policyText: { marginTop: 3, color: lumina.colors.onSurfaceVariant, fontSize: 12, lineHeight: 18 },
});
