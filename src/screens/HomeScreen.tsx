import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';
import { getMockHomeData, HomeData, AirLevel, DayReport, getUserProfile } from '../data';
import DayDetailScreen from './DayDetailScreen';
import StatDetailScreen from './StatDetailScreen';

const levelColor: Record<AirLevel, string> = {
  good: '#3FB65F',
  moderate: '#E8B93F',
  bad: '#E8903F',
  unhealthy: '#E8703F',
  veryUnhealthy: '#D33F3F',
  critical: '#E8703F',
  hazardous: '#9C27B0',
};

const levelLabel: Record<AirLevel, string> = {
  good: 'Good',
  moderate: 'Moderate',
  bad: 'Bad',
  unhealthy: 'Unhealthy',
  veryUnhealthy: 'Very Unhealthy',
  critical: 'Critical',
  hazardous: 'Hazardous',
};

function AccountDrawer({ visible, onClose, onLogout }: { visible: boolean; onClose: () => void; onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const user = getUserProfile();
  const slideAnim = useRef(new Animated.Value(320)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 320, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible && (slideAnim as any)._value === -320) {
    // still render for animation out, but after animation hide
  }

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={[drawerStyles.container, { opacity: visible ? 1 : 0 }]}>
      <Animated.View style={[drawerStyles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[drawerStyles.panel, { paddingTop: insets.top + 16, transform: [{ translateX: slideAnim }] }]}>
        <View style={drawerStyles.drawerHeader}>
          <Pressable onPress={onClose} style={drawerStyles.closeBtn}>
            <Ionicons name="close" size={20} color={palette.textStrong} />
          </Pressable>
          <Text style={drawerStyles.drawerTitle}>Account</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={drawerStyles.accountTop}>
            <View style={drawerStyles.avatar}>
              <Text style={drawerStyles.avatarText}>{user.name.split(' ').map((n) => n[0]).join('')}</Text>
            </View>
            <View style={drawerStyles.accountInfo}>
              <Text style={drawerStyles.accountName}>{user.name}</Text>
              <Text style={drawerStyles.accountEmail}>{user.email}</Text>
            </View>
            <Pressable style={drawerStyles.editProfileBtn}>
              <Text style={drawerStyles.editProfileText}>Edit</Text>
            </Pressable>
          </View>

          <View style={drawerStyles.divider} />

          <Pressable style={drawerStyles.accountRow}>
            <View style={drawerStyles.accountRowLeft}>
              <View style={drawerStyles.accountIcon}>
                <Ionicons name="lock-closed-outline" size={16} color={palette.textStrong} />
              </View>
              <Text style={drawerStyles.accountRowLabel}>Password & security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.text} />
          </Pressable>

          <Pressable style={drawerStyles.accountRow}>
            <View style={drawerStyles.accountRowLeft}>
              <View style={drawerStyles.accountIcon}>
                <Ionicons name="notifications-outline" size={16} color={palette.textStrong} />
              </View>
              <Text style={drawerStyles.accountRowLabel}>Manage notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.text} />
          </Pressable>

          <Pressable
            style={drawerStyles.accountRow}
            onPress={() =>
              Alert.alert('Log out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log out',
                  style: 'destructive',
                  onPress: () => {
                    onClose();
                    onLogout();
                  },
                },
              ])
            }
          >
            <View style={drawerStyles.accountRowLeft}>
              <View style={[drawerStyles.accountIcon, drawerStyles.accountIconDanger]}>
                <Ionicons name="log-out-outline" size={16} color={palette.unhealthy} />
              </View>
              <Text style={[drawerStyles.accountRowLabel, drawerStyles.logoutText]}>Log out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.unhealthy} />
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen({ onLogout }: { onLogout?: () => void }) {
  const [selected, setSelected] = useState<null | DayReport>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const data = getMockHomeData();

  if (selectedStat) {
    return <StatDetailScreen statKey={selectedStat} onBack={() => setSelectedStat(null)} />;
  }

  if (selected) {
    return <DayDetailScreen day={selected} onBack={() => setSelected(null)} />;
  }

  const getAQIMessage = (level: AirLevel) => {
    switch (level) {
      case 'good': return 'Air quality is safe. Have a nice day!';
      case 'moderate': return 'Air quality is acceptable but could be better.';
      case 'bad': return 'Air quality is lower than normal.';
      case 'unhealthy': return 'Air quality is unhealthy. Sensitive groups should limit outdoor activity.';
      case 'veryUnhealthy': return 'Air quality is very unhealthy. Take action immediately.';
      case 'critical': return 'Air quality is dangerous.';
      case 'hazardous': return 'HAZARDOUS: Emergency conditions. Stay indoors.';
    }
  };

  const getVentilationAdvice = (level: AirLevel) => {
    switch (level) {
      case 'critical':
      case 'hazardous': return 'EMERGENCY: Seal room · run all purifiers · contact authorities';
      case 'veryUnhealthy': return 'Run purifier on High · evacuate sensitive individuals';
      case 'unhealthy': return 'Run purifier on High · limit outdoor activity';
      case 'bad': return 'Open windows or run purifier on Auto';
      case 'moderate': return 'Consider opening windows';
      default: return null;
    }
  };

  const ventilationAdvice = getVentilationAdvice(data.level);
  const aqiMessage = getAQIMessage(data.level);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning, {data.name}</Text>
            <Text style={styles.dateLine}>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} · {data.location}</Text>
          </View>
          <Pressable style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="menu-outline" size={22} color={palette.brandDeep} />
          </Pressable>
        </View>

        <Pressable onPress={() => setSelectedStat('pm25')}>
          <LinearGradient
            colors={['#0F3E6B', '#1A6CB3', '#2980CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreTop}>
              <Text style={styles.scoreLabel}>POLLUTION SCORE</Text>
              <Ionicons name="cloud-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.pm25Text}>PM2.5</Text>
            <Text style={styles.scoreValue}>{data.score.toFixed(1)}<Text style={styles.scoreUnit}> µg/m³</Text></Text>
            <View style={styles.scoreBottom}>
              <View style={[styles.badge, { backgroundColor: levelColor[data.level] }]}>
                <Text style={styles.badgeText}>{levelLabel[data.level]}</Text>
              </View>
              <Text style={styles.scoreMessage}>{aqiMessage}</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.sensorsHeader}>
          <Text style={styles.sensorsTitle}>Average</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox value={`${data.temp} °C`} label="Temperature" onPress={() => setSelectedStat('temp')} />
          <StatBox value={`${data.humidity} %`} label="Relative Humidity" onPress={() => setSelectedStat('humidity')} />
          <StatBox value={`${data.co2} ppm`} label="Carbon Dioxide (CO₂)" onPress={() => setSelectedStat('co2')} />
          <StatBox value={`${data.co} ppm`} label="Carbon Monoxide (CO)" onPress={() => setSelectedStat('co')} />
          <StatBox value={`${data.voc}`} label="Volatile Organic Compounds (VOC)" onPress={() => setSelectedStat('voc')} />
          <StatBox value={`${data.nox}`} label="Nitrogen Oxides (NOₓ)" onPress={() => setSelectedStat('nox')} />
        </View>

        {ventilationAdvice && (
          <View style={styles.ventBanner}>
            <Text style={styles.ventTitle}>
              {data.level === 'critical' || data.level === 'hazardous' ? 'Emergency actions required' : 'Ventilation recommended'}
            </Text>
            <Text style={styles.ventMessage}>{ventilationAdvice}</Text>
          </View>
        )}

        <View style={styles.weeklyHeader}>
          <Text style={styles.weeklyTitle}>Weekly report</Text>
          <Pressable>
            <Text style={styles.weeklyLink}>This week</Text>
          </Pressable>
        </View>

        <View style={styles.weeklyCard}>
          {data.weekly.map((day, i) => (
            <Pressable key={day.day} onPress={() => setSelected(day)} style={[styles.dayRow, i < data.weekly.length - 1 && styles.dayBorder]}>
              <Ionicons name="cloud-outline" size={20} color={levelColor[day.level]} />
              <Text style={styles.dayName}>{day.day}</Text>
              <Text style={[styles.dayValue, { color: levelColor[day.level] }]}>{day.value.toFixed(1)}µg/m³</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <AccountDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={() => onLogout?.()} />
    </View>
  );
}

function StatBox({ value, label, sub, onPress }: { value: string; label: string; sub?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.statBox}>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const drawerStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 300, backgroundColor: '#FFFFFF', paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: -4, height: 0 }, elevation: 10 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F7FB', alignItems: 'center', justifyContent: 'center' },
  drawerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  accountTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.brandDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  accountInfo: { flex: 1, gap: 1 },
  accountName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  accountEmail: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  editProfileBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: palette.border, backgroundColor: '#F9FBFC' },
  editProfileText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  accountRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F7FB', alignItems: 'center', justifyContent: 'center' },
  accountIconDanger: { backgroundColor: '#FFF1F0' },
  accountRowLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: palette.textStrong },
  logoutText: { color: palette.unhealthy, fontFamily: 'Poppins_600SemiBold' },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceDeep,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: palette.textStrong,
    letterSpacing: 0.5,
  },
  dateLine: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: palette.brand,
    marginTop: 2,
  },
  menuBtn: {
    padding: 6,
  },

  scoreCard: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    marginBottom: 16,
    minHeight: 200,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.7)',
  },
  scoreValue: {
    fontSize: 52,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 18,
  },
  scoreUnit: {
    fontSize: 20,
    fontFamily: 'Poppins_400Regular',
  },
  scoreBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  scoreMessage: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  pm25Text: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFFCC',
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 20,
    paddingHorizontal: 6,
    minHeight: 84,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: palette.textStrong,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Poppins_400Regular',
    color: palette.text,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 11,
  },
  statSub: {
    fontSize: 9,
    fontFamily: 'Poppins_400Regular',
    color: palette.text,
    marginTop: 2,
  },

  ventBanner: {
    backgroundColor: '#FEF0E5',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 18,
  },
  ventTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: palette.unhealthy,
    marginBottom: 2,
  },
  ventMessage: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: palette.text,
  },

  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sensorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sensorsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: palette.textStrong,
  },
  weeklyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: palette.textStrong,
  },
  weeklyLink: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: palette.brand,
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  dayBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  dayName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: palette.textStrong,
  },
  dayValue: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
});