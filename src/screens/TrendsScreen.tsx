import { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import { palette } from '../styles/palette';

type TimeRange = 'day' | 'week' | 'month';

const timeRanges: { key: TimeRange; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

const legend = [
  { color: '#2E7DC9', label: 'CO₂' },
  { color: '#E8B93F', label: 'PM2.5' },
  { color: '#A78BFA', label: 'VOC' },
];

// 9 points to match mockup waviness — normalized 0 (top) to 1 (bottom)
const co2Data = [0.38, 0.34, 0.26, 0.28, 0.32, 0.22, 0.20, 0.24, 0.22];
const pmData = [0.58, 0.56, 0.60, 0.48, 0.52, 0.48, 0.52, 0.48, 0.46];
const vocData = [0.70, 0.69, 0.67, 0.69, 0.66, 0.66, 0.67, 0.66, 0.65];

const xLabels = ['12AM', '6AM', '12PM', '6PM', '12AM'];

const summaryRows = [
  { label: 'CO₂ average', value: '648 ppm', sub: 'Sensirion SCD41', peak: 'peak 812', color: palette.textStrong },
  { label: 'PM2.5 average', value: '21 µg/m³', sub: 'PMS5003', peak: 'peak 39', color: palette.textStrong },
  { label: 'Good-air hours', value: '17.2 hrs', sub: '% of monitored day', peak: '71.6%', color: palette.good },
];

function toPoints(data: number[], w: number, h: number, padX: number, padTop: number, padBot: number) {
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBot;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padTop + v * innerH,
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

function ChartLines({ w, h }: { w: number; h: number }) {
  const padX = 8;
  const padTop = 8;
  const padBot = 8;
  const dCO2 = useMemo(() => smoothPath(toPoints(co2Data, w, h, padX, padTop, padBot)), [w, h]);
  const dPM = useMemo(() => smoothPath(toPoints(pmData, w, h, padX, padTop, padBot)), [w, h]);
  const dVOC = useMemo(() => smoothPath(toPoints(vocData, w, h, padX, padTop, padBot)), [w, h]);
  const innerH = h - padTop - padBot;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ backgroundColor: '#FFFFFF' }}>
      {[0.25, 0.5, 0.75].map((frac) => (
        <Line
          key={frac}
          x1={padX}
          y1={padTop + frac * innerH}
          x2={w - padX}
          y2={padTop + frac * innerH}
          stroke="#E8ECF0"
          strokeWidth={1}
          strokeDasharray="6,6"
          strokeOpacity={0.9}
        />
      ))}
      <Path d={dVOC} stroke="#A78BFA" strokeWidth={1.7} fill="none" strokeDasharray="5,4" strokeLinecap="round" />
      <Path d={dPM} stroke="#E8B93F" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={dCO2} stroke="#2E7DC9" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function TrendsScreen() {
  const [range, setRange] = useState<TimeRange>('day');
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32; // screen pad 20*2 + card pad 16*2

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} style={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>HISTORICAL DATA</Text>
      <Text style={styles.screenTitle}>Trends</Text>

      <View style={styles.pillRow}>
        {timeRanges.map((r) => (
          <Pressable key={r.key} onPress={() => setRange(r.key)} style={[styles.pill, range === r.key && styles.pillActive]}>
            <Text style={[styles.pillText, range === r.key && styles.pillTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
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

        <View style={styles.chartWrap}>
          <ChartLines w={chartW} h={200} />
        </View>

        <View style={styles.xAxis}>
          {xLabels.map((label, idx) => (
            <Text key={`${label}-${idx}`} style={styles.xAxisLabel}>{label}</Text>
          ))}
        </View>
      </View>

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Today&apos;s summary</Text>
        <Text style={styles.summaryDate}>Aug 16</Text>
      </View>

      <View style={styles.summaryCard}>
        {summaryRows.map((row, i) => (
          <View key={row.label} style={[styles.summaryRow, i < summaryRows.length - 1 && styles.summaryBorder]}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summarySub}>{row.sub}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={[styles.summaryValue, { color: row.color }]}>{row.value}</Text>
              <Text style={styles.summaryPeak}>{row.peak}</Text>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  scroll: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: palette.surfaceDeep },
  sectionLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', letterSpacing: 1.4, color: palette.text, marginBottom: 4 },
  screenTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: palette.textStrong, marginBottom: 16 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: 9999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border },
  pillActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  pillText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: palette.textStrong },
  pillTextActive: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 18,
    width: '100%',
    overflow: 'hidden',
  },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8, alignSelf: 'flex-start' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  chartWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6, paddingHorizontal: 4 },
  xAxisLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  summaryTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: palette.textStrong },
  summaryDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: palette.border },
  summaryLeft: { gap: 2 },
  summaryLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  summarySub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  summaryRight: { alignItems: 'flex-end', gap: 2 },
  summaryValue: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  summaryPeak: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
});
