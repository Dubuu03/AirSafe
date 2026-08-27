import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';

export default function OnboardingScreen({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <LinearGradient colors={['#1A5A8A', '#0B2E4F']} style={styles.screen}>
      <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.orbWrap}>
          <View style={styles.orbGlow} />
          <View style={styles.orb}>
            <View style={styles.orbShine} />
          </View>
        </View>

        <Text style={styles.title}>AirSafe</Text>
        <Text style={styles.subtitle}>
          Monitor your office&apos;s air quality 24/7.{'\n'}Get personalized updates and alerts.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.primaryBtn} onPress={onRegister}>
          <Text style={styles.primaryBtnText}>Register</Text>
        </Pressable>

        <Pressable onPress={onLogin}>
          <Text style={styles.loginRow}>
            I already have an account — <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </Pressable>

        <Text style={styles.footer}>ESP32 · CO · PM · CO₂ · VOC/NOX</Text>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  orbWrap: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  orbGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#4A9AD4', opacity: 0.25 },
  orb: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#C5DDE8', overflow: 'hidden', borderWidth: 1, borderColor: '#D8EAF4' },
  orbShine: { position: 'absolute', top: 16, left: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', opacity: 0.7 },
  title: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#FFFFFF', marginBottom: 12 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#B0C4D8', textAlign: 'center', lineHeight: 22 },
  bottom: { paddingHorizontal: 32, paddingBottom: 48 },
  primaryBtn: { backgroundColor: '#FFFFFF', borderRadius: 9999, paddingVertical: 16, marginBottom: 16 },
  primaryBtnText: { textAlign: 'center', fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#0B2E4F' },
  loginRow: { textAlign: 'center', fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#8AADC4' },
  loginLink: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  footer: { textAlign: 'center', fontSize: 10, fontFamily: 'Poppins_400Regular', color: '#5A7A94', marginTop: 48, letterSpacing: 1 },
});
