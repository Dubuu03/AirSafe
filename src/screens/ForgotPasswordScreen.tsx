import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';

export default function ForgotPasswordScreen({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
        </Pressable>

        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.eyebrow}>FORGOT YOUR PASSWORD?</Text>
        <Text style={styles.desc}>
          Enter the email linked to your AirSafe account{'\n'}and we&apos;ll send you a link to reset it.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={palette.text}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Send reset link</Text>
        </Pressable>

        <Text style={styles.loginRow}>
          Remembered it?{' '}
          <Text style={styles.loginLink} onPress={onLogin}>Log in</Text>
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="water-outline" size={18} color="#3D84C7" />
          <Text style={styles.infoText}>
            Didn&apos;t get the email? Check your spam folder, or wait a minute and try again — reset links expire after 30 minutes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 54, paddingBottom: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: palette.brandDeep, marginBottom: 8 },
  eyebrow: { fontSize: 10, fontFamily: 'Poppins_400Regular', letterSpacing: 1.6, color: palette.text, marginBottom: 8 },
  desc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 20, marginBottom: 24 },
  input: { borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', color: palette.textStrong, marginBottom: 16 },
  primaryBtn: { borderRadius: 9999, backgroundColor: palette.brandDeep, paddingVertical: 16, marginBottom: 14 },
  primaryBtnText: { textAlign: 'center', fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  loginRow: { textAlign: 'center', fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#5F6F74', marginBottom: 24 },
  loginLink: { fontFamily: 'Poppins_600SemiBold', color: palette.brandDeep },
  infoCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 18, paddingVertical: 18, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 18, flexShrink: 1 },
});
