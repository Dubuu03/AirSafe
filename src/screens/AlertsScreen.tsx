import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { palette } from '../styles/palette';
import { getAlerts, getAlertById, getAlertSummary, resolveAlert, AlertItem, AlertLevel } from '../data';

const levelMeta: Record<AlertLevel, { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  unhealthy: { color: palette.unhealthy, label: 'Unhealthy', icon: 'warning-outline' },
  moderate: { color: palette.moderate, label: 'Moderate', icon: 'cloud-outline' },
  good: { color: palette.good, label: 'Resolved', icon: 'checkmark' },
  veryUnhealthy: { color: palette.hazardous, label: 'Very Unhealthy', icon: 'alert-circle-outline' },
};

function AlertCard({ item, onPress, resolved }: { item: AlertItem; onPress?: () => void; resolved?: boolean }) {
  const meta = levelMeta[item.level];
  const isResolved = resolved || item.level === 'good';
  const clickable = isResolved ? false : (item.level === 'unhealthy' || item.level === 'veryUnhealthy');
  const borderColor = isResolved ? undefined : meta.color;
  return (
    <Pressable onPress={onPress} style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: isResolved ? palette.good + '18' : `${meta.color}18` }]}>
          <Ionicons name={isResolved ? 'checkmark' : meta.icon} size={20} color={isResolved ? palette.good : meta.color} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>{new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
            <Text style={[styles.cardLevel, { color: isResolved ? palette.good : meta.color }]}>{isResolved ? 'Resolved' : meta.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function DetailView({ item, onBack, onResolved }: { item: AlertItem; onBack: () => void; onResolved: () => void }) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const chartW = winW - 40 - 32;
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 160 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.detailHeader}>
          <Pressable onPress={onBack} style={styles.detailBack}>
            <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
          </Pressable>
          <View>
            <Text style={styles.detailTitle}>{item.title}</Text>
            <Text style={styles.detailSub}>{item.roomName} · {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
          </View>
        </View>

        <Text style={styles.bigValue}>{item.value.toFixed(1)}</Text>
        <Text style={styles.bigUnit}>{item.unit}</Text>
        <View style={[styles.detailBadge, { backgroundColor: `${levelMeta[item.level].color}18` }]}>
          <View style={[styles.dotSm, { backgroundColor: levelMeta[item.level].color }]} />
          <Text style={[styles.detailBadgeText, { color: levelMeta[item.level].color }]}>{levelMeta[item.level].label}</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: palette.brand }]} />
              <Text style={styles.legendText}>{item.title} — {item.unit}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#F5E6C8' }]} />
              <Text style={styles.legendText}>Threshold: {item.threshold} {item.unit}</Text>
            </View>
          </View>
          <Svg width={chartW} height={160} viewBox={`0 0 ${chartW} 160`}>
            <Rect x={0} y={24} width={chartW} height={18} fill="#FFF4D6" opacity={0.9} />
            <Path
              d={(() => {
                const pts = item.chartData || [];
                if (pts.length === 0) return '';
                let d = `M ${pts[0].x},${pts[0].y}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = pts[Math.max(i - 1, 0)];
                  const p1 = pts[i];
                  const p2 = pts[i + 1];
                  const p3 = pts[Math.min(i + 2, pts.length - 1)];
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
              strokeWidth={2.2}
              fill="none"
            />
          </Svg>
          <View style={styles.xAxis}>
            {['-40m', '-30m', '-20m', '-10m', 'Now'].map((l) => <Text key={l} style={styles.xLabel}>{l}</Text>)}
          </View>
        </View>

        <View style={styles.recCard}>
          <Text style={styles.recTitle}>RECOMMENDED ACTION</Text>
          <Text style={styles.recText}>
            Increase ventilation or run the purifier on High until the reading returns below {item.threshold} {item.unit}. 
            This alert will auto-resolve once the value stays under the threshold for 10 consecutive minutes.
          </Text>
        </View>

        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>Add a note</Text>
          <Text style={styles.noteOpt}>Optional</Text>
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. \u201cOpened windows, running purifier on High\u201d"
          placeholderTextColor={palette.text}
          style={styles.noteInput}
          multiline
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
          onBlur={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />

        <View style={styles.notifyRow}>
          <View>
            <Text style={styles.notifyTitle}>Notify facilities team</Text>
            <Text style={styles.notifySub}>Send this resolution note to Judy</Text>
          </View>
          <Switch value={notify} onValueChange={setNotify} trackColor={{ true: palette.brand }} />
        </View>

        {(item.level === 'unhealthy' || item.level === 'veryUnhealthy') && (
          <Pressable onPress={onResolved} style={styles.markBtn}>
            <Text style={styles.markText}>Mark as resolved</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function ResolvedAllView({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.detailHeader}>
          <Pressable onPress={onBack} style={styles.detailBack}><Ionicons name="arrow-back" size={18} color={palette.textStrong} /></Pressable>
          <View><Text style={styles.detailTitle}>Alerts</Text><Text style={styles.detailSub}>Room 204 · Main Library</Text></View>
        </View>

        <View style={styles.checkCircle}><Ionicons name="checkmark" size={28} color={palette.good} /></View>
        <Text style={styles.resolvedTitle}>All alerts resolved</Text>
        <Text style={styles.resolvedSub}>All alerts marked resolved. Room 204 is{'\n'}back within safe air quality range.</Text>
        <Text style={styles.resolvedTime}>RESOLVED AT {time.toUpperCase()}</Text>

        <View style={styles.resolvedCard}>
          <View style={styles.resolvedRow}>
            <View><Text style={styles.resolvedRowTitle}>PM2.5 exceeded threshold</Text><Text style={styles.resolvedRowSub}>Resolved · ventilation increased</Text></View>
            <Ionicons name="checkmark" size={14} color={palette.good} />
          </View>
          <View style={styles.divider} />
          <View style={styles.resolvedRow}>
            <View><Text style={styles.resolvedRowTitle}>CO₂ elevated</Text><Text style={styles.resolvedRowSub}>Resolved · auto-cleared</Text></View>
            <Ionicons name="checkmark" size={14} color={palette.good} />
          </View>
        </View>

        <Pressable onPress={onBack} style={styles.backToBtn}>
          <Text style={styles.backToText}>Back to Alerts</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const isTodayAlert = (a: AlertItem) => Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000;

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(3);
  const [view, setView] = useState<'list' | 'resolved'>('list');
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const all = getAlerts();
  const [today, setToday] = useState<AlertItem[]>(all.filter(isTodayAlert));
  const [yesterday, setYesterday] = useState<AlertItem[]>(all.filter((a) => !isTodayAlert(a)));

  if (selected) return <DetailView item={selected} onBack={() => setSelected(null)} onResolved={() => {
    const isToday = today.some((x) => x.id === selected.id);
    if (isToday) setToday((p) => p.map((x) => x.id === selected.id ? { ...x, level: 'good' as AlertLevel, resolved: true, resolvedAt: new Date().toISOString() } : x));
    else setYesterday((p) => p.map((x) => x.id === selected.id ? { ...x, level: 'good' as AlertLevel, resolved: true, resolvedAt: new Date().toISOString() } : x));
    setSelected(null);
    setActive((v) => Math.max(0, v - 1));
  }} />;
  if (view === 'resolved') return <ResolvedAllView onBack={() => setView('list')} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>THRESHOLD EVENTS</Text>
        <Text style={styles.title}>Alerts</Text>

        {active > 0 && (
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryTitle}>{active} active alerts</Text>
              <Text style={styles.summarySub}>Room 204 · Main Library</Text>
            </View>
            <Pressable onPress={() => {
              setToday((p) => p.map((x) => ({ ...x, level: 'good' as AlertLevel, resolved: true, resolvedAt: new Date().toISOString() })));
              setYesterday((p) => p.map((x) => ({ ...x, level: 'good' as AlertLevel, resolved: true, resolvedAt: new Date().toISOString() })));
              setActive(0);
            }} style={styles.resolveBtn}>
              <Text style={styles.resolveText}>Resolve all</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionLabel}>TODAY</Text>
        {today.length ? today.map((a) => <AlertCard key={a.id} item={a} onPress={() => setSelected(a)} />) : <Text style={styles.emptyText}>No alerts</Text>}

        <Text style={styles.sectionLabel}>YESTERDAY</Text>
        {yesterday.length ? yesterday.map((a) => <AlertCard key={a.id} item={a} onPress={() => setSelected(a)} />) : <Text style={styles.emptyText}>No older alerts</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  eyebrow: { fontSize: 10, fontFamily: 'Poppins_400Regular', letterSpacing: 1.4, color: palette.text, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: palette.textStrong, marginBottom: 14 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF1E8', borderWidth: 1, borderColor: '#FDE4D3', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 14 },
  summaryTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  summarySub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 2 },
  resolveBtn: { backgroundColor: '#FFFFFF', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: palette.border },
  resolveText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  sectionLabel: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', letterSpacing: 1.4, color: palette.text, marginTop: 10, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: palette.border, borderLeftWidth: 4, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, minHeight: 80 },
  cardRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  cardDesc: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardTime: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  cardLevel: { fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text, marginBottom: 10 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  detailBack: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  detailSub: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },
  bigValue: { fontSize: 60, fontFamily: 'Poppins_700Bold', color: palette.textStrong, textAlign: 'center' },
  bigUnit: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: palette.text, textAlign: 'center', marginTop: 4 },
  detailBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, marginTop: 10, marginBottom: 18 },
  dotSm: { width: 8, height: 8, borderRadius: 4 },
  detailBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, marginBottom: 12, minHeight: 140 },
  chartLegend: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  xLabel: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  recCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10, minHeight: 110 },
  recTitle: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', letterSpacing: 1, color: palette.text, marginBottom: 8 },
  recText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text, lineHeight: 18 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  noteOpt: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  noteInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, fontFamily: 'Poppins_400Regular', color: palette.textStrong, minHeight: 76, textAlignVertical: 'top', marginBottom: 12 },
  notifyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  notifyTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  notifySub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 2 },
  markBtn: { backgroundColor: palette.good, borderRadius: 9999, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  markText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  checkCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#E6F7EB', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 14 },
  resolvedTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: palette.textStrong, textAlign: 'center' },
  resolvedSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: palette.text, textAlign: 'center', marginTop: 6, lineHeight: 16 },
  resolvedTime: { fontSize: 10, fontFamily: 'Poppins_400Regular', letterSpacing: 1, color: palette.text, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  resolvedCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  resolvedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  resolvedRowTitle: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  resolvedRowSub: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },
  divider: { height: 1, backgroundColor: palette.border },
  backToBtn: { backgroundColor: palette.brandDeep, borderRadius: 9999, paddingVertical: 14, alignItems: 'center' },
  backToText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
});