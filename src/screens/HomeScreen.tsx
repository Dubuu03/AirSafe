import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';
import { HomeData, goodData, badData, criticalData, AirLevel } from '../data/homeContent';
import DayDetailScreen from './DayDetailScreen';

const levelColor: Record<AirLevel, string> = {
  good: '#3FB65F',
  bad: '#E8B93F',
  critical: '#E8703F',
};

const levelLabel: Record<AirLevel, string> = {
  good: 'Good',
  bad: 'Bad',
  critical: 'Critical',
};

export default function HomeScreen() {
  const [variant, setVariant] = useState<HomeData>(goodData);
  const [selected, setSelected] = useState<null | (typeof goodData.weekly)[number]>(null);
  const insets = useSafeAreaInsets();

  const data = variant;

  if (selected) {
    return <DayDetailScreen day={selected.day} value={selected.value} level={selected.level} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{data.greeting}, {data.name}</Text>
            <Text style={styles.dateLine}>{data.date} · {data.location}</Text>
          </View>
          <Pressable style={styles.menuBtn}>
            <Ionicons name="menu-outline" size={22} color={palette.brandDeep} />
          </Pressable>
        </View>

        <LinearGradient
          colors={['#0F3E6B', '#1A6CB3', '#2980CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <View style={styles.scoreTop}>
            <Text style={styles.scoreLabel}>POLLUTION SCORE</Text>
            <Ionicons name={data.weatherIcon} size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.scoreValue}>{data.score}<Text style={styles.scoreUnit}>µg/m³</Text></Text>
          <View style={styles.scoreBottom}>
            <View style={[styles.badge, { backgroundColor: levelColor[data.level] }]}>
              <Text style={styles.badgeText}>{levelLabel[data.level]}</Text>
            </View>
            <Text style={styles.scoreMessage}>{data.message}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatBox value={data.temp} label="Temp · High" />
          <StatBox value={data.humidity} label="Humidity" />
          <StatBox value={data.rainfall} label="Rainfall" />
        </View>

        {data.ventilation && (
          <View style={styles.ventBanner}>
            <Text style={styles.ventTitle}>
              {data.level === 'critical' ? 'Evacuate poorly ventilated areas' : 'Ventilation recommended'}
            </Text>
            <Text style={styles.ventMessage}>{data.ventilation}</Text>
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
              <Ionicons name={day.icon} size={20} color={levelColor[day.level]} />
              <Text style={styles.dayName}>{day.day}</Text>
              <Text style={[styles.dayValue, { color: levelColor[day.level] }]}>{day.value}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* variant switcher for preview — remove later */}
      {/* <View style={styles.variantRow}>
        <Pressable onPress={() => setVariant(goodData)} style={[styles.variantBtn, variant.level === 'good' && styles.variantActive]}>
          <Text style={[styles.variantBtnText, variant.level === 'good' && styles.variantBtnTextActive]}>Good</Text>
        </Pressable>
        <Pressable onPress={() => setVariant(badData)} style={[styles.variantBtn, variant.level === 'bad' && styles.variantActive]}>
          <Text style={[styles.variantBtnText, variant.level === 'bad' && styles.variantBtnTextActive]}>Bad</Text>
        </Pressable>
        <Pressable onPress={() => setVariant(criticalData)} style={[styles.variantBtn, variant.level === 'critical' && styles.variantActive]}>
          <Text style={[styles.variantBtnText, variant.level === 'critical' && styles.variantBtnTextActive]}>Critical</Text>
        </Pressable>
      </View> */}
    </View>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

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

  /* score card */
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

  /* stat boxes */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: palette.textStrong,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: palette.text,
    marginTop: 2,
  },

  /* ventilation banner */
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

  /* weekly report */
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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

  /* variant switcher (preview only) */
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  variantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: palette.surface,
  },
  variantActive: {
    backgroundColor: palette.brandDeep,
  },
  variantBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: palette.textStrong,
  },
  variantBtnTextActive: {
    color: '#FFFFFF',
  },
});
