import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../styles/palette';
import EditThresholdsScreen from './EditThresholdsScreen';
import { getDeviceInfo, getThresholds, appVersion, buildNumber } from '../data';

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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [pushAlerts, setPushAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [autoPurifier, setAutoPurifier] = useState(false);
  const [editing, setEditing] = useState(false);

  const device = getDeviceInfo();
  const thresholds = getThresholds();

  if (editing) return <EditThresholdsScreen onBack={() => setEditing(false)} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CONFIGURATION</Text>
        <Text style={styles.title}>Device & Thresholds</Text>

        <View style={styles.deviceCard}>
          <View style={styles.deviceTop}>
            <View>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceSub}>{device.model} · {device.location}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{device.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.deviceStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{device.sensors.find(s => s.type === 'temperature')?.value || 0}°C</Text>
              <Text style={styles.statLabel}>TEMPERATURE</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{device.sensors.find(s => s.type === 'humidity')?.value || 0}%</Text>
              <Text style={styles.statLabel}>HUMIDITY</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{device.sensors.find(s => s.type === 'co2')?.value || 0} ppm</Text>
              <Text style={styles.statLabel}>CO₂</Text>
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
          <ThresholdRow label="PM2.5" range={`${thresholds.pm25.warning}–${thresholds.pm25.unhealthy} µg/m³`} value={thresholds.pm25.warning / thresholds.pm25.critical} />
          <ThresholdRow label="PM10" range={`${thresholds.pm10.warning}–${thresholds.pm10.unhealthy} µg/m³`} value={thresholds.pm10.warning / thresholds.pm10.critical} />
          <ThresholdRow label="CO₂" range={`${thresholds.co2.warning}–${thresholds.co2.unhealthy} ppm`} value={thresholds.co2.warning / thresholds.co2.critical} />
          <ThresholdRow label="VOC" range={`${thresholds.voc.warning}–${thresholds.voc.unhealthy} idx`} value={thresholds.voc.warning / thresholds.voc.critical} />
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

        <Text style={styles.versionText}>AirSafe v{appVersion}</Text>
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
  versionText: { textAlign: 'center', fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 8, marginBottom: 8 },
});