import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';
import EditThresholdsScreen from './EditThresholdsScreen';

function ThresholdRow({ label, range, value }: { label: string; range: string; value: number }) {
  return (
    <View style={styles.thresholdRow}>
      <View style={styles.thresholdHeader}>
        <Text style={styles.thresholdLabel}>{label}</Text>
        <Text style={styles.thresholdRange}>{range}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barSeg, { flex: 2, backgroundColor: palette.good }]} />
        <View style={[styles.barSeg, { flex: 2, backgroundColor: '#E8B93F' }]} />
        <View style={[styles.barSeg, { flex: 3, backgroundColor: palette.unhealthy }]} />
        <View style={[styles.knob, { left: `${value * 100}%` }]} />
      </View>
    </View>
  );
}

export default function SettingsScreen({ onLogout }: { onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const [pushAlerts, setPushAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [autoPurifier, setAutoPurifier] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) return <EditThresholdsScreen onBack={() => setEditing(false)} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CONFIGURATION</Text>
        <Text style={styles.title}>Device & Thresholds</Text>

        <View style={styles.deviceCard}>
          <View style={styles.deviceTop}>
            <View>
              <Text style={styles.deviceName}>AirSafe Node 01</Text>
              <Text style={styles.deviceSub}>ESP32-WROOM · Room 204</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.deviceStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>−52 dBm</Text>
              <Text style={styles.statLabel}>WI-FI SIGNAL</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2s</Text>
              <Text style={styles.statLabel}>SYNC LATENCY</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>99.4%</Text>
              <Text style={styles.statLabel}>UPTIME (7D)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alert thresholds</Text>
          <Pressable onPress={() => setEditing(true)}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <ThresholdRow label="PM2.5" range="0–35 µg/m³" value={0.65} />
          <ThresholdRow label="CO₂" range="400–1000 ppm" value={0.45} />
          <ThresholdRow label="VOC Index" range="0–250 idx" value={0.28} />
        </View>

        <Text style={styles.sectionTitleSingle}>Notifications</Text>

        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View style={styles.notifText}>
              <Text style={styles.notifTitle}>Push alerts</Text>
              <Text style={styles.notifSub}>Threshold breaches, instantly</Text>
            </View>
            <Switch value={pushAlerts} onValueChange={setPushAlerts} trackColor={{ true: palette.brand }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.notifRow}>
            <View style={styles.notifText}>
              <Text style={styles.notifTitle}>Daily summary</Text>
              <Text style={styles.notifSub}>9:00 AM digest email</Text>
            </View>
            <Switch value={dailySummary} onValueChange={setDailySummary} trackColor={{ true: palette.brand }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.notifRow}>
            <View style={styles.notifText}>
              <Text style={styles.notifTitle}>Auto-purifier trigger</Text>
              <Text style={styles.notifSub}>Activate on Unhealthy reading</Text>
            </View>
            <Switch value={autoPurifier} onValueChange={setAutoPurifier} trackColor={{ true: palette.brand }} />
          </View>
        </View>

        <Text style={styles.sectionTitleSingle}>Account</Text>

        <View style={styles.card}>
          <View style={styles.accountTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RJ</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>RJ Dela Cruz</Text>
              <Text style={styles.accountEmail}>rj@emb.gov.ph</Text>
            </View>
            <Pressable style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.accountRow}>
            <View style={styles.accountRowLeft}>
              <View style={styles.accountIcon}>
                <Ionicons name="lock-closed-outline" size={16} color={palette.textStrong} />
              </View>
              <Text style={styles.accountRowLabel}>Password & security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.text} />
          </Pressable>

          <Pressable style={styles.accountRow}>
            <View style={styles.accountRowLeft}>
              <View style={styles.accountIcon}>
                <Ionicons name="notifications-outline" size={16} color={palette.textStrong} />
              </View>
              <Text style={styles.accountRowLabel}>Manage notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.text} />
          </Pressable>

          <Pressable
            style={styles.accountRow}
            onPress={() =>
              Alert.alert('Log out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: onLogout },
              ])
            }
          >
            <View style={styles.accountRowLeft}>
              <View style={[styles.accountIcon, styles.accountIconDanger]}>
                <Ionicons name="log-out-outline" size={16} color={palette.unhealthy} />
              </View>
              <Text style={[styles.accountRowLabel, styles.logoutText]}>Log out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.unhealthy} />
          </Pressable>
        </View>

        <Text style={styles.versionText}>AirSafe v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  eyebrow: { fontSize: 10, fontFamily: 'Poppins_400Regular', letterSpacing: 1.4, color: palette.text, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: palette.textStrong, marginBottom: 14 },
  deviceCard: {
    backgroundColor: palette.ink,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    marginBottom: 20,
    minHeight: 148,
    justifyContent: 'center',
  },
  deviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  deviceName: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  deviceSub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: palette.good },
  liveText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: palette.good, letterSpacing: 0.6 },
  deviceStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  stat: { alignItems: 'flex-start' },
  statValue: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  statLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 4, letterSpacing: 0.4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  sectionTitleSingle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong, marginBottom: 10, marginTop: 4 },
  editText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.brand },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  thresholdRow: { marginBottom: 18 },
  thresholdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  thresholdLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  thresholdRange: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  barTrack: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'visible', backgroundColor: '#EFF3F5' },
  barSeg: { height: 10 },
  knob: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0F1E2E',
    marginLeft: -10,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  notifText: { gap: 2 },
  notifTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  notifSub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 12 },
  accountTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.brandDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  accountInfo: { flex: 1, gap: 1 },
  accountName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  accountEmail: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  editProfileBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: palette.border, backgroundColor: '#F9FBFC' },
  editProfileText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  accountRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F7FB', alignItems: 'center', justifyContent: 'center' },
  accountIconDanger: { backgroundColor: '#FFF1F0' },
  accountRowLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: palette.textStrong },
  logoutText: { color: palette.unhealthy, fontFamily: 'Poppins_600SemiBold' },
  versionText: { textAlign: 'center', fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 8, marginBottom: 8 },
});
