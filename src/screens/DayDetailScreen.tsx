import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { palette } from '../styles/palette';
import { AirLevel } from '../data';

const levelMeta: Record<AirLevel, { label: string; color: string; bg: string }> = {
  good: { label: 'Good', color: palette.good, bg: '#E6F7EB' },
  moderate: { label: 'Moderate', color: '#D9A441', bg: '#FFF4D6' },
  bad: { label: 'Bad', color: '#E8903F', bg: '#FFF4D6' },
  unhealthy: { label: 'Unhealthy', color: palette.unhealthy, bg: '#FFE8E0' },
  veryUnhealthy: { label: 'Very Unhealthy', color: '#D33F3F', bg: '#FFE8E0' },
  critical: { label: 'Critical', color: palette.unhealthy, bg: '#FFE8E0' },
  hazardous: { label: 'Hazardous', color: '#9C27B0', bg: '#F3E5F5' },
};

export default function DayDetailScreen({
  day,
  value,
  level,
  onBack,
}: {
  day: string;
  value: number;
  level: AirLevel;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32;

  const pts = [0.7, 0.65, 0.68, 0.5, 0.42, 0.45, 0.38, 0.32, 0.35];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
          </Pressable>
          <View>
            <Text style={styles.hTitle}>Fine Particulate — PM2.5</Text>
            <Text style={styles.hSub}>PM5003 · laser scattering sensor</Text>
          </View>
        </View>

        <Text style={styles.bigValue}>{value.toFixed(1)}</Text>
        <Text style={styles.bigUnit}>micrograms per cubic meter (µg/m³)</Text>

        <View style={[styles.badge, { backgroundColor: levelMeta[level].bg }]}>
          <View style={[styles.badgeDot, { backgroundColor: levelMeta[level].color }]} />
          <Text style={[styles.badgeText, { color: levelMeta[level].color }]}>{levelMeta[level].label}</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: palette.brand }]} />
              <Text style={styles.legendText}>PM2.5 — 24h</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#F5E6C8' }]} />
              <Text style={styles.legendText}>Threshold band</Text>
            </View>
          </View>

          <Svg width={chartW} height={110} viewBox={`0 0 ${chartW} 110`}>
            <Rect x={0} y={22} width={chartW} height={18} fill="#FFF4D6" opacity={0.9} />
            <Line x1={0} y1={82} x2={chartW} y2={82} stroke="#E8ECF0" strokeWidth={1} strokeDasharray="4,4" />
            <Path
              d={(() => {
                const w = chartW;
                const h = 80;
                const points = pts.map((v, i) => ({ x: (i / (pts.length - 1)) * w, y: 10 + v * h }));
                let d = `M ${points[0].x},${points[0].y}`;
                for (let i = 0; i < points.length - 1; i++) {
                  const p0 = points[Math.max(i - 1, 0)];
                  const p1 = points[i];
                  const p2 = points[i + 1];
                  const p3 = points[Math.min(i + 2, points.length - 1)];
                  const t = 0.25;
                  const cp1x = p1.x + (p2.x - p0.x) * t;
                  const cp1y = p1.y + (p2.y - p0.y) * t;
                  const cp2x = p2.x - (p3.x - p1.x) * t;
                  const cp2y = p2.y - (p3.y - p1.y) * t;
                  d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                }
                return d;
              })()}
              stroke={palette.brand}
              strokeWidth={2}
              fill="none"
            />
          </Svg>
          <View style={styles.xAxis}>
            {['12AM', '6AM', '12PM', '6PM', 'Now'].map((l) => (
              <Text key={l} style={styles.xLabel}>{l}</Text>
            ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>9</Text>
            <Text style={styles.statSub}>PM1.0 µg/m³</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{value.toFixed(1)}</Text>
            <Text style={styles.statSub}>PM2.5 µg/m³</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>31</Text>
            <Text style={styles.statSub}>PM10 µg/m³</Text>
          </View>
        </View>

        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>WHY IT MATTERS</Text>
          <Text style={styles.whyText}>
            PM2.5 particles are small enough to reach the lungs and bloodstream. Sustained readings above 25 µg/m³ are linked to fatigue and
            irritation — consider ventilation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  hTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  hSub: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },
  bigValue: { fontSize: 52, fontFamily: 'Poppins_700Bold', color: palette.textStrong, textAlign: 'center' },
  bigUnit: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, textAlign: 'center', marginTop: 2 },
  badge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9999, marginTop: 10, marginBottom: 16 },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  badgeText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, marginBottom: 12 },
  chartLegend: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: palette.border, paddingVertical: 12, alignItems: 'center' },
  statVal: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: palette.textStrong },
  statSub: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 2 },
  whyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 14 },
  whyTitle: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', letterSpacing: 1.2, color: palette.text, marginBottom: 6 },
  whyText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 16 },
});