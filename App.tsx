import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { palette } from './src/styles/palette';
import HomeScreen from './src/screens/HomeScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

type Tab = 'home' | 'trends' | 'alerts' | 'settings';

const tabs: { key: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'home', icon: 'home-outline', label: 'Home' },
  { key: 'trends', icon: 'bar-chart-outline', label: 'Trends' },
  { key: 'alerts', icon: 'notifications-outline', label: 'Alerts' },
  { key: 'settings', icon: 'settings-outline', label: 'Settings' },
];

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tabStyles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {tabs.map((tab) => (
        <Pressable key={tab.key} style={tabStyles.item} onPress={() => onSelect(tab.key)}>
          <Ionicons name={tab.icon} size={22} color={active === tab.key ? palette.brand : palette.text} />
          <Text style={[tabStyles.label, active === tab.key && tabStyles.labelActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

type AuthView = 'onboarding' | 'auth' | 'forgotPassword';

function AppContent() {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [authView, setAuthView] = useState<AuthView | null>('onboarding');

  useEffect(() => {
    Font.loadAsync({
      Poppins_400Regular,
      Poppins_600SemiBold,
      Poppins_700Bold,
    }).then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {authView === 'onboarding' ? (
        <OnboardingScreen onLogin={() => setAuthView('auth')} onRegister={() => setAuthView('auth')} />
      ) : authView === 'auth' ? (
        <AuthScreen onLogin={() => setAuthView(null)} onForgotPassword={() => setAuthView('forgotPassword')} />
      ) : authView === 'forgotPassword' ? (
        <ForgotPasswordScreen onBack={() => setAuthView('auth')} onLogin={() => setAuthView('auth')} />
      ) : (
        <>
          <View style={styles.screenArea}>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'trends' && <TrendsScreen />}
            {activeTab === 'alerts' && <AlertsScreen />}
            {activeTab === 'settings' &&             <SettingsScreen onLogout={() => setAuthView('onboarding')} />}
          </View>
          <TabBar active={activeTab} onSelect={setActiveTab} />
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.surfaceDeep,
  },
  screenArea: {
    flex: 1,
    backgroundColor: palette.surfaceDeep,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: palette.text,
  },
  labelActive: {
    color: palette.brand,
  },
});
