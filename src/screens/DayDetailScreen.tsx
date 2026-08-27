import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';
import { palette } from '../styles/palette';
import { AirLevel, DayReport } from '../data';

const levelMeta: Record<AirLevel, { label: string; color: string; bg: string }> = {
  good: { label: 'Good', color: palette.good, bg: '#E6F7EB' },
  moderate: { label: 'Moderate', color: '#D9A441', bg: '#FFF4D6' },
  bad: { label: 'Bad', color: '#E8903F', bg: '#FFF4D6' },
  unhealthy: { label: 'Unhealthy', color: palette.unhealthy, bg: '#FFE8E0' },
  veryUnhealthy: { label: 'Very Unhealthy', color: '#D33F3F', bg: '#FFE8E0' },
  critical: { label: 'Critical', color: palette.unhealthy, bg: '#FFE8E0' },
  hazardous: { label: 'Hazardous', color: '#9C27B0', bg: '#F3E5F5' },
};

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function toPointsNormalized(data: number[], w: number, h: number, padX: number, padTop: number, padBot: number, vOffset: number, vScale: number) {
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBot;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padTop + (1 - (v - min) / range) * innerH * vScale + innerH * vOffset,
  }));
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t = 0.22;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function generateDayPoints(base: number, variance: number): number[] {
  return Array.from({ length: 9 }, (_, i) =>
    Math.max(0, base + Math.sin(i * 0.7) * variance + (Math.random() - 0.5) * variance * 0.6)
  );
}

const legend = [
  { color: '#2980CC', label: 'PM2.5' },
  { color: '#3FB65F', label: 'Temperature' },
  { color: '#06B6D4', label: 'Relative Humidity' },
  { color: '#14B8A6', label: 'CO₂' },
  { color: '#E8703F', label: 'CO' },
  { color: '#A78BFA', label: 'Volatile Organic Compounds (VOC)' },
  { color: '#D33F3F', label: 'Nitrogen Oxides (NOₓ)' },
];

function CombinedChart({ w, h, day }: { w: number; h: number; day: DayReport }) {
  const padX = 8;
  const padTop = 8;
  const padBot = 8;
  const innerH = h - padTop - padBot;

  const co2 = generateDayPoints(day.co2, 80);
  const pm25 = generateDayPoints(day.pm25, 15);
  const voc = generateDayPoints(day.voc, 25);
  const co = generateDayPoints(day.co, 1.5);
  const temp = generateDayPoints(day.temp, 3);
  const humidity = generateDayPoints(day.humidity, 8);
  const nox = generateDayPoints(day.nox, 10);

  const dCO2 = smoothPath(toPointsNormalized(co2, w, h, padX, padTop, padBot, 0.0, 0.24));
  const dPM = smoothPath(toPointsNormalized(pm25, w, h, padX, padTop, padBot, 0.26, 0.24));
  const dVOC = smoothPath(toPointsNormalized(voc, w, h, padX, padTop, padBot, 0.52, 0.24));
  const dCO = smoothPath(toPointsNormalized(co, w, h, padX, padTop, padBot, 0.78, 0.24));
  const dTemp = smoothPath(toPointsNormalized(temp, w, h, padX, padTop, padBot, 0.02, 0.22));
  const dHum = smoothPath(toPointsNormalized(humidity, w, h, padX, padTop, padBot, 0.28, 0.22));
  const dNOx = smoothPath(toPointsNormalized(nox, w, h, padX, padTop, padBot, 0.54, 0.22));

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ backgroundColor: '#FFFFFF' }}>
      {[0.25, 0.5, 0.75].map((frac) => (
        <Line key={frac} x1={padX} y1={padTop + frac * innerH} x2={w - padX} y2={padTop + frac * innerH} stroke="#E8ECF0" strokeWidth={1} strokeDasharray="6,6" strokeOpacity={0.9} />
      ))}
      {dTemp ? <Path d={dTemp} stroke="#3FB65F" strokeWidth={1.2} fill="none" strokeLinecap="round" /> : null}
      {dHum ? <Path d={dHum} stroke="#06B6D4" strokeWidth={1.2} fill="none" strokeLinecap="round" /> : null}
      {dCO2 ? <Path d={dCO2} stroke="#14B8A6" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {dPM ? <Path d={dPM} stroke="#2980CC" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {dVOC ? <Path d={dVOC} stroke="#A78BFA" strokeWidth={1.5} fill="none" strokeDasharray="5,4" strokeLinecap="round" /> : null}
      {dCO ? <Path d={dCO} stroke="#E8703F" strokeWidth={1.2} fill="none" strokeLinecap="round" /> : null}
      {dNOx ? <Path d={dNOx} stroke="#D33F3F" strokeWidth={1.2} fill="none" strokeDasharray="3,3" strokeLinecap="round" /> : null}
    </Svg>
  );
}

export default function DayDetailScreen({
  day,
  onBack,
}: {
  day: DayReport;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
          </Pressable>
          <View>
            <Text style={styles.hTitle}>{day.day}</Text>
            <Text style={styles.hSub}>{day.date}</Text>
          </View>
        </View>

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
          <Text style={styles.scoreValue}>{day.pm25.toFixed(1)}<Text style={styles.scoreUnit}> µg/m³</Text></Text>
          <View style={styles.scoreBottom}>
            <View style={[styles.badge, { backgroundColor: levelMeta[day.level].bg }]}>
              <View style={[styles.badgeDot, { backgroundColor: levelMeta[day.level].color }]} />
              <Text style={[styles.badgeText, { color: levelMeta[day.level].color }]}>{levelMeta[day.level].label}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatBox value={`${day.temp} °C`} label="Temperature" />
          <StatBox value={`${day.humidity} %`} label="Relative Humidity" />
          <StatBox value={`${day.co2} ppm`} label="Carbon Dioxide (CO₂)" />
          <StatBox value={`${day.co} ppm`} label="Carbon Monoxide (CO)" />
          <StatBox value={`${day.voc}`} label="Volatile Organic Compounds (VOC)" />
          <StatBox value={`${day.nox}`} label="Nitrogen Oxides (NOₓ)" />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.legendRow}>
            {legend.map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>

          <CombinedChart w={chartW} h={190} day={day} />

          <View style={styles.xAxis}>
            {['12AM', '6AM', '12PM', '6PM', '11PM'].map((l) => (
              <Text key={l} style={styles.xLabel}>{l}</Text>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  hTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: palette.textStrong },
  hSub: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },

  scoreCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 14,
  },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scoreLabel: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF99', letterSpacing: 1 },
  pm25Text: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFFCC' },
  scoreValue: { fontSize: 42, fontFamily: 'Poppins_700Bold', color: '#FFFFFF' },
  scoreUnit: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#FFFFFF99' },
  scoreBottom: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999 },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  badgeText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 70,
  },
  statVal: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  statLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 4, textAlign: 'center', lineHeight: 11 },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  xLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text },

  whyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 14 },
  whyTitle: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', letterSpacing: 1.2, color: palette.text, marginBottom: 6 },
  whyText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 16 },
});
