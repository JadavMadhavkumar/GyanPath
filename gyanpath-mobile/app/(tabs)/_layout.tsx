import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lumina } from '../../src/theme/lumina';

export default function TabsLayout() {
  const icon = (
    inactiveName: keyof typeof Ionicons.glyphMap,
    activeName: keyof typeof Ionicons.glyphMap,
    active: boolean
  ) => (
    <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
      <Ionicons name={active ? activeName : inactiveName} size={20} color={active ? '#fff' : lumina.colors.onSurfaceVariant} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: lumina.colors.primary,
        tabBarInactiveTintColor: lumina.colors.onSurfaceVariant,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => icon('home-outline', 'home', focused),
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => icon('book-outline', 'book', focused),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ focused }) => icon('help-circle-outline', 'help-circle', focused),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ focused }) => icon('chatbubble-ellipses-outline', 'chatbubble-ellipses', focused),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => icon('wallet-outline', 'wallet', focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    backgroundColor: 'rgba(248,249,255,0.88)',
    paddingBottom: 10,
    paddingTop: 10,
    height: 74,
    position: 'absolute',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrap: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  iconWrapActive: {
    backgroundColor: lumina.colors.primary,
  },
});
