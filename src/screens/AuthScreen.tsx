import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';

type AuthMode = 'login' | 'register';

export default function AuthScreen({ onLogin, onForgotPassword }: { onLogin: () => void; onForgotPassword: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {mode === 'login' ? (
          <LoginForm onSwapMode={() => setMode('register')} onForgotPassword={onForgotPassword} onLogin={onLogin} />
        ) : (
          <RegisterForm onSwapMode={() => setMode('login')} onLogin={onLogin} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ placeholder, secureTextEntry = false }: { placeholder: string; secureTextEntry?: boolean }) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.inputShell}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={palette.text}
        secureTextEntry={secureTextEntry && hidden}
        style={styles.input}
      />
      {secureTextEntry && (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={palette.text} />
        </Pressable>
      )}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SocialRow() {
  return (
    <View style={styles.socialWrap}>
      <Text style={styles.socialTitle}>OR CONTINUE WITH</Text>
      <View style={styles.socialRow}>
        {[
          { icon: 'logo-facebook' as const },
          { icon: 'logo-apple' as const },
          { icon: 'logo-google' as const },
        ].map((item) => (
          <Pressable key={item.icon} style={styles.socialButton}>
            <Ionicons name={item.icon} size={18} color="#5F6F74" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function LoginForm({ onSwapMode, onForgotPassword, onLogin }: { onSwapMode: () => void; onForgotPassword: () => void; onLogin: () => void }) {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>LOG IN TO VIEW YOUR ROOM&apos;S LIVE AIR QUALITY</Text>

      <InputField placeholder="Enter email or user name" />
      <InputField placeholder="Password" secureTextEntry />

      <Text style={styles.forgot} onPress={onForgotPassword}>Forgot your password?</Text>
      <PrimaryButton label="Log in" onPress={onLogin} />

      <Text style={styles.helper}>
        Don&apos;t have an account?{' '}
        <Text style={styles.linkText} onPress={onSwapMode}>
          Sign up
        </Text>
      </Text>

      <SocialRow />
    </View>
  );
}

function RegisterForm({ onSwapMode, onLogin }: { onSwapMode: () => void; onLogin: () => void }) {
  return (
    <View style={styles.form}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>SET UP ALERTS FOR YOUR ROOM IN UNDER A MINUTE</Text>

      <InputField placeholder="Enter email or user name" />
      <InputField placeholder="Password" secureTextEntry />
      <InputField placeholder="Confirm password" secureTextEntry />

      <PrimaryButton label="Register" onPress={onLogin} />

      <Text style={styles.helper}>
        Already have an account?{' '}
        <Text style={styles.linkText} onPress={onSwapMode}>
          Log in
        </Text>
      </Text>

      <SocialRow />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceDeep,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  form: {
    gap: 4,
  },
  title: {
    marginBottom: 4,
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: palette.brandDeep,
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: palette.text,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: palette.textStrong,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#3D84C7',
  },
  primaryButton: {
    borderRadius: 9999,
    backgroundColor: palette.brandDeep,
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  helper: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#5F6F74',
  },
  linkText: {
    fontFamily: 'Poppins_600SemiBold',
    color: palette.brandDeep,
  },
  socialWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  socialTitle: {
    marginBottom: 12,
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    letterSpacing: 1.5,
    color: '#6F7C7D',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
