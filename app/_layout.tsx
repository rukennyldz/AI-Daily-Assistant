import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8e8e93',
          tabBarStyle: { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff' },
        }}
      >
        <Tabs.Screen
          name="daily"
          options={{ title: 'Daily' }}
        />
        <Tabs.Screen
          name="history"
          options={{ title: 'History' }}
        />
        <Tabs.Screen
          name="summary"
          options={{ title: 'Summary' }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
