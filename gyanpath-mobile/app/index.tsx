import { Redirect, type Href } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { lumina } from '../src/theme/lumina';

export default function Index() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={lumina.colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Typed routes can lag new files in CI/dev shells; cast keeps startup route stable.
  return <Redirect href={'/(auth)/onboarding' as Href} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lumina.colors.surface,
  },
});
