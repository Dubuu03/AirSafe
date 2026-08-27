import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';
import { palette } from '../styles/palette';

function generateDayPoints(base: number, variance: number): number[] {
  return Array.from({ length: 9 }, (_, i) =>
    Math.max(0, base + Math.sin(i * 0.7) * variance + (Math.random() - 0.5) * variance * 0.6)
  );
}

function toPointsNormalized(data: number[], w: number, h: number, padX: number, padTop: number, padBot: number) {
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBot;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padTop + (1 - (v - min) / range) * innerH,
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

interface StatInfo {
  key: string;
  label: string;
  fullName: string;
  value: number;
  unit: string;
  color: string;
  gradient: [string, string, string];
  sensor: string;
  whyItMatters: string;
}

const statDetails: Record<string, StatInfo> = {
  pm25: {
    key: 'pm25', label: 'PM2.5', fullName: 'Fine Particulate — PM2.5',
    value: 12.2, unit: 'µg/m³', color: '#E8B93F', gradient: ['#0F3E6B', '#1A6CB3', '#2980CC'],
    sensor: 'PMS5003 · laser scattering sensor',
    whyItMatters: 'PM2.5 particles are small enough to reach the lungs and bloodstream. Sustained readings above 25 µg/m³ are linked to fatigue and irritation — consider ventilation.',
  },
  temp: {
    key: 'temp', label: 'Temperature', fullName: 'Temperature',
    value: 0, unit: '°C', color: '#3FB65F', gradient: ['#1A6B3F', '#2E8B57', '#3FB65F'],
    sensor: 'SHT40 · digital temperature sensor',
    whyItMatters: 'Temperature affects indoor comfort and air quality perception. High temperatures can increase pollutant off-gassing and reduce occupant comfort.',
  },
  humidity: {
    key: 'humidity', label: 'Relative Humidity', fullName: 'Relative Humidity',
    value: 0, unit: '% RH', color: '#06B6D4', gradient: ['#065A6B', '#0891B2', '#06B6D4'],
    sensor: 'SHT40 · digital humidity sensor',
    whyItMatters: 'Humidity below 30% causes dry skin and irritation. Above 60% promotes mold and dust mites. Ideal range is 40–60% RH.',
  },
  co2: {
    key: 'co2', label: 'CO₂', fullName: 'Carbon Dioxide (CO₂)',
    value: 0, unit: 'ppm', color: '#14B8A6', gradient: ['#064E45', '#0D9488', '#14B8A6'],
    sensor: 'SCD41 · NDIR CO₂ sensor',
    whyItMatters: 'CO₂ above 1000 ppm causes drowsiness and reduced focus. Above 2000 ppm leads to headaches. Ventilate when levels rise.',
  },
  co: {
    key: 'co', label: 'CO', fullName: 'Carbon Monoxide (CO)',
    value: 0, unit: 'ppm', color: '#E8703F', gradient: ['#8B3A0F', '#CC5500', '#E8703F'],
    sensor: 'MiCS-5524 · electrochemical CO sensor',
    whyItMatters: 'CO is odorless and dangerous above 35 ppm. Sustained exposure causes headaches and dizziness. Ensure proper ventilation immediately.',
  },
  voc: {
    key: 'voc', label: 'VOC', fullName: 'Volatile Organic Compounds (VOC)',
    value: 0, unit: '', color: '#A78BFA', gradient: ['#4A2D8C', '#7C5CBF', '#A78BFA'],
    sensor: 'SGP41 · MOX VOC sensor',
    whyItMatters: 'High VOC levels from paints, cleaners, and furniture cause eye irritation and headaches. Open windows or use air purifiers when elevated.',
  },
  nox: {
    key: 'nox', label: 'NOₓ', fullName: 'Nitrogen Oxides (NOₓ)',
    value: 0, unit: '', color: '#D33F3F', gradient: ['#7A1A1A', '#B33030', '#D33F3F'],
    sensor: 'MiCS-6814 · NO₂ sensor',
    whyItMatters: 'NOₓ from combustion and traffic irritates airways. Prolonged exposure worsens asthma and respiratory conditions.',
  },
};

const relatedStats: Record<string, { label: string; value: string }[]> = {
  pm25: [
    { label: 'PM1.0', value: '9 µg/m³' },
    { label: 'PM10', value: '31 µg/m³' },
    { label: '24h High', value: '40 µg/m³' },
  ],
  temp: [
    { label: 'Heat Index', value: '31 °C' },
    { label: 'Dew Point', value: '19 °C' },
    { label: '24h High', value: '32 °C' },
  ],
  humidity: [
    { label: 'Dew Point', value: '19 °C' },
    { label: '24h High', value: '72%' },
    { label: '24h Low', value: '48%' },
  ],
  co2: [
    { label: 'Outdoor ~420', value: 'ppm' },
    { label: '24h High', value: '1200 ppm' },
    { label: 'Ventilation', value: 'Recommended' },
  ],
  co: [
    { label: 'Safe Limit', value: '< 9 ppm' },
    { label: '24h High', value: '5.2 ppm' },
    { label: 'Status', value: 'Safe' },
  ],
  voc: [
    { label: 'Outdoor ~50', value: '' },
    { label: '24h High', value: '180' },
    { label: 'Status', value: 'Elevated' },
  ],
  nox: [
    { label: 'Outdoor ~20', value: '' },
    { label: '24h High', value: '52' },
    { label: 'Source', value: 'Combustion' },
  ],
};

export default function StatDetailScreen({
  statKey,
  onBack,
}: {
  statKey: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32;

  const info = statDetails[statKey];
  if (!info) return null;

  const baseValues: Record<string, number> = { co: 2.5, temp: 28, humidity: 62, co2: 850, voc: 85, nox: 22, pm25: 12.2 };
  const variances: Record<string, number> = { co: 1.5, temp: 3, humidity: 8, co2: 80, voc: 25, nox: 10, pm25: 15 };
  const chartData = generateDayPoints(baseValues[statKey] ?? 50, variances[statKey] ?? 10);
  const pts = toPointsNormalized(chartData, chartW, 120, 8, 8, 8);
  const d = smoothPath(pts);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
          </Pressable>
          <View>
            <Text style={styles.hTitle}>{info.fullName}</Text>
            <Text style={styles.hSub}>{info.sensor}</Text>
          </View>
        </View>

        <LinearGradient
          colors={info.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <View style={styles.scoreTop}>
            <Text style={styles.scoreLabel}>{info.label}</Text>
            <Ionicons name="cloud-outline" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.scoreValue}>
            {info.key === 'co' ? '2.4' : info.key === 'temp' ? '28' : info.key === 'humidity' ? '62' : info.key === 'co2' ? '850' : info.key === 'voc' ? '85' : '22'}
            <Text style={styles.scoreUnit}> {info.unit}</Text>
          </Text>
        </LinearGradient>

        <View style={styles.chartCard}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: info.color }]} />
              <Text style={styles.legendLabel}>{info.label} — 24h</Text>
            </View>
          </View>

          <Svg width={chartW} height={120} viewBox={`0 0 ${chartW} 120`}>
            {[0.25, 0.5, 0.75].map((frac) => (
              <Line key={frac} x1={8} y1={8 + frac * 104} x2={chartW - 8} y2={8 + frac * 104} stroke="#E8ECF0" strokeWidth={1} strokeDasharray="4,4" />
            ))}
            {d ? <Path d={d} stroke={info.color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          </Svg>

          <View style={styles.xAxis}>
            {['12AM', '6AM', '12PM', '6PM', 'Now'].map((l) => (
              <Text key={l} style={styles.xLabel}>{l}</Text>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>SUMMARY</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {statKey === 'co' ? '2.5' : statKey === 'temp' ? '28' : statKey === 'humidity' ? '62' : statKey === 'co2' ? '850' : statKey === 'voc' ? '85' : statKey === 'nox' ? '22' : '12.2'}
              </Text>
              <Text style={styles.summaryLabel}>Now</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {statKey === 'co' ? '2.3' : statKey === 'temp' ? '27' : statKey === 'humidity' ? '58' : statKey === 'co2' ? '820' : statKey === 'voc' ? '78' : statKey === 'nox' ? '20' : '11.8'}
              </Text>
              <Text style={styles.summaryLabel}>Last 6h</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {statKey === 'co' ? '2.1' : statKey === 'temp' ? '26' : statKey === 'humidity' ? '55' : statKey === 'co2' ? '780' : statKey === 'voc' ? '72' : statKey === 'nox' ? '18' : '10.5'}
              </Text>
              <Text style={styles.summaryLabel}>Last 24h</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: palette.good }]}>
                {statKey === 'co' ? '1.2' : statKey === 'temp' ? '24' : statKey === 'humidity' ? '42' : statKey === 'co2' ? '650' : statKey === 'voc' ? '45' : statKey === 'nox' ? '10' : '8.1'}
              </Text>
              <Text style={styles.summaryLabel}>min</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {statKey === 'co' ? '2.5' : statKey === 'temp' ? '28' : statKey === 'humidity' ? '62' : statKey === 'co2' ? '850' : statKey === 'voc' ? '85' : statKey === 'nox' ? '22' : '12.2'}
              </Text>
              <Text style={styles.summaryLabel}>avg</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: palette.unhealthy }]}>
                {statKey === 'co' ? '4.0' : statKey === 'temp' ? '32' : statKey === 'humidity' ? '72' : statKey === 'co2' ? '1200' : statKey === 'voc' ? '180' : statKey === 'nox' ? '52' : '40.6'}
              </Text>
              <Text style={styles.summaryLabel}>max</Text>
            </View>
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
  scoreValue: { fontSize: 48, fontFamily: 'Poppins_700Bold', color: '#FFFFFF' },
  scoreUnit: { fontSize: 18, fontFamily: 'Poppins_400Regular', color: '#FFFFFF99' },

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
  legendRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  xLabel: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: palette.text },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 14,
  },
  summaryTitle: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', letterSpacing: 1.2, color: palette.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: palette.textStrong },
  summaryLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 4 },
  summaryDivider: { width: 1, height: 32, backgroundColor: palette.border },
});
