import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { lumina } from '../../src/theme/lumina';

const SUGGESTIONS = ['Explain completing the square', 'Review my errors', 'Start Math Quiz'];

export default function AssistantScreen() {
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <View style={styles.botIcon}>
            <Text style={styles.botIconText}>🤖</Text>
          </View>
          <Text style={styles.title}>Your Personal Digital Mentor</Text>
          <Text style={styles.subtitle}>I&apos;m here to help you master your curriculum.</Text>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
          <View style={styles.aiBubble}>
            <Text style={styles.bubbleText}>
              Hello! I noticed you have Mathematics practice pending. Want revision or a quick test?
            </Text>
          </View>
        </View>

        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>Help me with quadratic formula derivation.</Text>
          </View>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
          <View style={styles.aiBubble}>
            <Text style={styles.bubbleText}>Start from ax² + bx + c = 0 and complete the square.</Text>
            <View style={styles.formulaCard}>
              <Text style={styles.formulaLabel}>KEY FORMULA</Text>
              <Text style={styles.formulaText}>x = (-b ± √(b² - 4ac)) / 2a</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SUGGESTIONS.map((chip) => (
            <TouchableOpacity key={chip} style={styles.chip} accessibilityLabel={chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your question here..."
          placeholderTextColor={lumina.colors.onSurfaceVariant}
          style={styles.input}
          accessibilityLabel="Assistant input"
        />
        <TouchableOpacity style={styles.sendBtn} accessibilityLabel="Send message">
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lumina.colors.surface, paddingBottom: 82 },
  content: { padding: 16, gap: 24 },
  intro: { alignItems: 'center', marginTop: 8 },
  botIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: lumina.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  botIconText: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '700', color: lumina.colors.onSurface, textAlign: 'center' },
  subtitle: { fontSize: 14, color: lumina.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 },
  aiRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  userRow: { alignItems: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lumina.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  aiBubble: {
    backgroundColor: lumina.colors.surfaceHigh,
    padding: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    maxWidth: '82%',
  },
  userBubble: {
    backgroundColor: lumina.colors.primary,
    padding: 14,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    maxWidth: '80%',
  },
  bubbleText: { color: lumina.colors.onSurface, fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  formulaCard: {
    marginTop: 12,
    backgroundColor: lumina.colors.surfaceLowest,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: lumina.colors.primary,
  },
  formulaLabel: { color: lumina.colors.primary, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  formulaText: { color: lumina.colors.onSurface, fontSize: 16, fontWeight: '600' },
  chips: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: lumina.colors.surfaceHigh,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { color: lumina.colors.primary, fontSize: 12, fontWeight: '600' },
  inputBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    backgroundColor: 'rgba(248,249,255,0.9)',
    borderRadius: 26,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: lumina.colors.surfaceLow,
    borderRadius: 18,
    height: 42,
    paddingHorizontal: 14,
    color: lumina.colors.onSurface,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lumina.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
