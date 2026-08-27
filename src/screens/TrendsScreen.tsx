import { useState, useRef, useCallback } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { palette } from '../styles/palette';
import { getTrendData, getXLabels } from '../data';

type TimeRange = 'day' | 'week' | 'month';

const timeRanges: { key: TimeRange; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

interface MeasurementCard {
  key: string;
  label: string;
  unit: string;
  color: string;
  data: (t: ReturnType<typeof getTrendData>) => number[];
  summary: (t: ReturnType<typeof getTrendData>) => { avg: number; min: number; max: number };
}

const measurements: MeasurementCard[] = [
  {
    key: 'pm25',
    label: 'PM2.5',
    unit: 'µg/m³',
    color: '#2980CC',
    data: (t) => t.pm25.map((d) => d.y),
    summary: (t) => t.summary.pm25,
  },
  {
    key: 'temp',
    label: 'Temperature',
    unit: '°C',
    color: '#3FB65F',
    data: (t) => t.temp.map((d) => d.y),
    summary: (t) => t.summary.temp,
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '% RH',
    color: '#06B6D4',
    data: (t) => t.humidity.map((d) => d.y),
    summary: (t) => t.summary.humidity,
  },
  {
    key: 'co2',
    label: 'CO₂',
    unit: 'ppm',
    color: '#14B8A6',
    data: (t) => t.co2.map((d) => d.y),
    summary: (t) => t.summary.co2,
  },
  {
    key: 'co',
    label: 'CO',
    unit: 'ppm',
    color: '#E8703F',
    data: (t) => t.co.map((d) => d.y),
    summary: (t) => t.summary.co,
  },
  {
    key: 'voc',
    label: 'Volatile Organic Compounds (VOC)',
    unit: '',
    color: '#A78BFA',
    data: (t) => t.voc.map((d) => d.y),
    summary: (t) => t.summary.voc,
  },
  {
    key: 'nox',
    label: 'Nitrogen Oxides (NOₓ)',
    unit: '',
    color: '#D33F3F',
    data: (t) => t.nox.map((d) => d.y),
    summary: (t) => t.summary.nox,
  },
];

function toPointsNormalized(data: number[], w: number, h: number, padX: number, padTop: number, padBot: number) {
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBot;
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padTop + (1 - (v - min) / range) * innerH,
    rawY: v,
    index: i,
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

function formatValue(val: number, unit: string): string {
  if (unit === 'ppm' || unit === 'µg/m³' || unit === 'Index' || unit === '% RH') return Math.round(val).toString();
  return val.toFixed(1);
}

function ChartWithTooltip({
  data, w, h, color, unit,
}: {
  data: number[]; w: number; h: number; color: string; unit: string;
}) {
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);
  const padX = 8;
  const padTop = 8;
  const padBot = 8;
  const pts = toPointsNormalized(data, w, h, padX, padTop, padBot);
  const d = smoothPath(pts);
  const innerH = h - padTop - padBot;

  const getIndex = useCallback((x: number) => {
    if (pts.length === 0) return 0;
    const innerW = w - padX * 2;
    const ratio = Math.max(0, Math.min(1, (x - padX) / innerW));
    return Math.max(0, Math.min(pts.length - 1, Math.round(ratio * (pts.length - 1))));
  }, [pts, w]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setTooltipIdx(getIndex(e.nativeEvent.locationX));
      },
      onPanResponderMove: (e) => {
        setTooltipIdx(getIndex(e.nativeEvent.locationX));
      },
      onPanResponderRelease: () => {
        setTooltipIdx(null);
      },
      onPanResponderTerminate: () => {
        setTooltipIdx(null);
      },
    })
  ).current;

  const tipPt = tooltipIdx !== null && pts[tooltipIdx] ? pts[tooltipIdx] : null;

  return (
    <View style={{ width: w, height: h + 24 }}>
      <View style={{ width: w, height: h }} {...responder.panHandlers}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ backgroundColor: '#FFFFFF' }}>
          {[0.25, 0.5, 0.75].map((frac) => (
            <Line key={frac} x1={padX} y1={padTop + frac * innerH} x2={w - padX} y2={padTop + frac * innerH} stroke="#E8ECF0" strokeWidth={1} strokeDasharray="6,6" strokeOpacity={0.9} />
          ))}
          {d ? <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {tipPt && (
            <>
              <Line x1={tipPt.x} y1={padTop} x2={tipPt.x} y2={h - padBot} stroke={color} strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.5} />
              <Circle cx={tipPt.x} cy={tipPt.y} r={5} fill={color} />
              <Circle cx={tipPt.x} cy={tipPt.y} r={3} fill="#FFFFFF" />
            </>
          )}
        </Svg>
      </View>
      {tipPt && (
        <View style={[tooltipStyles.tooltip, { left: Math.max(0, Math.min(w - 80, tipPt.x - 40)) }]}>
          <Text style={tooltipStyles.tooltipText}>{formatValue(tipPt.rawY, unit)}</Text>
        </View>
      )}
    </View>
  );
}

const tooltipStyles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: 0,
    backgroundColor: palette.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
});

export default function TrendsScreen() {
  const [range, setRange] = useState<TimeRange>('day');
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32;

  const trendData = getTrendData(range);
  const xLabels = getXLabels(range);

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

        {measurements.map((m) => {
          const values = m.data(trendData);
          const s = m.summary(trendData);
          return (
            <View key={m.key} style={styles.chartCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardDot, { backgroundColor: m.color }]} />
                <Text style={styles.cardTitle}>{m.label}</Text>
                {m.unit ? <Text style={styles.cardUnit}>{m.unit}</Text> : null}
              </View>

              <ChartWithTooltip
                data={values}
                w={chartW}
                h={160}
                color={m.color}
                unit={m.unit}
              />

              <View style={styles.xAxis}>
                {xLabels.map((label, idx) => (
                  <Text key={`${label}-${idx}`} style={styles.xAxisLabel}>{label}</Text>
                ))}
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{m.key === 'co' || m.key === 'temp' || m.key === 'humidity' ? s.avg.toFixed(1) : Math.round(s.avg)}</Text>
                  <Text style={styles.summaryLabel}>avg</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: palette.good }]}>{m.key === 'co' || m.key === 'temp' || m.key === 'humidity' ? s.min.toFixed(1) : Math.round(s.min)}</Text>
                  <Text style={styles.summaryLabel}>min</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: palette.unhealthy }]}>{m.key === 'co' || m.key === 'temp' || m.key === 'humidity' ? s.max.toFixed(1) : Math.round(s.max)}</Text>
                  <Text style={styles.summaryLabel}>max</Text>
                </View>
              </View>
            </View>
          );
        })}
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
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 14,
    width: '100%',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  cardUnit: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },

  xAxis: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingHorizontal: 4 },
  xAxisLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  summaryLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 2 },
});
