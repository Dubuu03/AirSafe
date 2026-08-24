import { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../styles/palette';

type Props = { onBack: () => void };

const PM_MAX = 50;
const CO_MAX = 1600;
const VOC_MAX = 400;

function DualSlider({
  v1,
  v2,
  onV1,
  onV2,
}: {
  v1: number;
  v2: number;
  onV1: (v: number) => void;
  onV2: (v: number) => void;
}) {
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  const v1Ref = useRef(v1);
  const v2Ref = useRef(v2);
  const onV1Ref = useRef(onV1);
  const onV2Ref = useRef(onV2);
  v1Ref.current = v1;
  v2Ref.current = v2;
  onV1Ref.current = onV1;
  onV2Ref.current = onV2;
  // keep wRef in sync
  const onLayout = (e: LayoutChangeEvent) => {
    const nw = e.nativeEvent.layout.width;
    setW(nw);
    wRef.current = nw;
  };
  // also keep wRef updated when w changes (for handler that closes over)
  // create stable responders once
  const startV1 = useRef(0);
  const startV2 = useRef(0);

  const pan1Ref = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startV1.current = v1Ref.current;
      },
      onPanResponderMove: (_, gs) => {
        const width = wRef.current;
        if (!width) return;
        const next = Math.min(Math.max(startV1.current + gs.dx / width, 0), v2Ref.current - 0.06);
        onV1Ref.current(next);
      },
    })
  );

  const pan2Ref = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startV2.current = v2Ref.current;
      },
      onPanResponderMove: (_, gs) => {
        const width = wRef.current;
        if (!width) return;
        const next = Math.min(Math.max(startV2.current + gs.dx / width, v1Ref.current + 0.06), 1);
        onV2Ref.current(next);
      },
    })
  );

  return (
    <View style={styles.barWrap} onLayout={onLayout}>
      <View style={styles.barTrack}>
        <View style={[styles.barSeg, { flex: 2, backgroundColor: palette.good }]} />
        <View style={[styles.barSeg, { flex: 2, backgroundColor: '#E8B93F' }]} />
        <View style={[styles.barSeg, { flex: 3, backgroundColor: palette.unhealthy }]} />
      </View>
      <View style={[styles.knobWrap, { left: w ? v1 * w - 18 : 0 }]} {...pan1Ref.current.panHandlers}>
        <View style={styles.knob} />
      </View>
      <View style={[styles.knobWrap, { left: w ? v2 * w - 18 : 0 }]} {...pan2Ref.current.panHandlers}>
        <View style={styles.knob} />
      </View>
    </View>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="number-pad" style={styles.fieldInput} />
    </View>
  );
}

export default function EditThresholdsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  const [pmV1, setPmV1] = useState(0.32);
  const [pmV2, setPmV2] = useState(0.64);
  const [coV1, setCoV1] = useState(0.38);
  const [coV2, setCoV2] = useState(0.62);
  const [vocV1, setVocV1] = useState(0.30);
  const [vocV2, setVocV2] = useState(0.52);

  const [pmGood, setPmGood] = useState('12');
  const [pmMod, setPmMod] = useState('35');
  const [coGood, setCoGood] = useState('800');
  const [coMod, setCoMod] = useState('1000');
  const [vocGood, setVocGood] = useState('100');
  const [vocMod, setVocMod] = useState('250');

  const [coApply, setCoApply] = useState(true);
  const [thApply, setThApply] = useState(false);

  const syncPmV1 = (v: number) => {
    setPmV1(v);
    setPmGood(String(Math.round(v * PM_MAX)));
  };
  const syncPmV2 = (v: number) => {
    setPmV2(v);
    setPmMod(String(Math.round(v * PM_MAX)));
  };
  const syncCoV1 = (v: number) => {
    setCoV1(v);
    setCoGood(String(Math.round(v * CO_MAX)));
  };
  const syncCoV2 = (v: number) => {
    setCoV2(v);
    setCoMod(String(Math.round(v * CO_MAX)));
  };
  const syncVocV1 = (v: number) => {
    setVocV1(v);
    setVocGood(String(Math.round(v * VOC_MAX)));
  };
  const syncVocV2 = (v: number) => {
    setVocV2(v);
    setVocMod(String(Math.round(v * VOC_MAX)));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={palette.textStrong} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Edit Thresholds</Text>
            <Text style={styles.headerSub}>Set the Good / Moderate / Unhealthy cutoffs</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Text style={styles.rowLabel}>PM2.5</Text>
            <Text style={styles.rowUnit}>µg/m³</Text>
          </View>
          <DualSlider v1={pmV1} v2={pmV2} onV1={syncPmV1} onV2={syncPmV2} />
          <View style={styles.fieldsRow}>
            <Field
              label="Good ≤"
              value={pmGood}
              onChange={(t) => {
                setPmGood(t);
                const n = parseInt(t);
                if (!isNaN(n)) setPmV1(Math.min(Math.max(n / PM_MAX, 0), pmV2 - 0.06));
              }}
            />
            <Field
              label="Moderate ≤"
              value={pmMod}
              onChange={(t) => {
                setPmMod(t);
                const n = parseInt(t);
                if (!isNaN(n)) setPmV2(Math.min(Math.max(n / PM_MAX, pmV1 + 0.06), 1));
              }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowHead}>
            <Text style={styles.rowLabel}>CO₂</Text>
            <Text style={styles.rowUnit}>ppm</Text>
          </View>
          <DualSlider v1={coV1} v2={coV2} onV1={syncCoV1} onV2={syncCoV2} />
          <View style={styles.fieldsRow}>
            <Field
              label="Good ≤"
              value={coGood}
              onChange={(t) => {
                setCoGood(t);
                const n = parseInt(t);
                if (!isNaN(n)) setCoV1(Math.min(Math.max(n / CO_MAX, 0), coV2 - 0.06));
              }}
            />
            <Field
              label="Moderate ≤"
              value={coMod}
              onChange={(t) => {
                setCoMod(t);
                const n = parseInt(t);
                if (!isNaN(n)) setCoV2(Math.min(Math.max(n / CO_MAX, coV1 + 0.06), 1));
              }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowHead}>
            <Text style={styles.rowLabel}>VOC Index</Text>
            <Text style={styles.rowUnit}>idx</Text>
          </View>
          <DualSlider v1={vocV1} v2={vocV2} onV1={syncVocV1} onV2={syncVocV2} />
          <View style={styles.fieldsRow}>
            <Field
              label="Good ≤"
              value={vocGood}
              onChange={(t) => {
                setVocGood(t);
                const n = parseInt(t);
                if (!isNaN(n)) setVocV1(Math.min(Math.max(n / VOC_MAX, 0), vocV2 - 0.06));
              }}
            />
            <Field
              label="Moderate ≤"
              value={vocMod}
              onChange={(t) => {
                setVocMod(t);
                const n = parseInt(t);
                if (!isNaN(n)) setVocV2(Math.min(Math.max(n / VOC_MAX, vocV1 + 0.06), 1));
              }}
            />
          </View>
        </View>

        <Text style={styles.alsoTitle}>Also apply to</Text>

        <View style={styles.card}>
          <View style={styles.applyRow}>
            <View>
              <Text style={styles.applyTitle}>Carbon Monoxide (CO)</Text>
              <Text style={styles.applySub}>0–4 ppm · WHO baseline</Text>
            </View>
            <Switch value={coApply} onValueChange={setCoApply} trackColor={{ true: palette.brand }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.applyRow}>
            <View>
              <Text style={styles.applyTitle}>Temperature & Humidity</Text>
              <Text style={styles.applySub}>Comfort range</Text>
            </View>
            <Switch value={thApply} onValueChange={setThApply} trackColor={{ true: palette.brand }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surfaceDeep },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  headerSub: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rowLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  rowUnit: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: palette.text },
  barWrap: { height: 36, justifyContent: 'center', marginBottom: 10 },
  barTrack: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#EFF3F5' },
  barSeg: { height: 10 },
  knobWrap: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0F1E2E',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fieldsRow: { flexDirection: 'row', gap: 10 },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FBFC',
  },
  fieldLabel: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text },
  fieldInput: { flex: 1, fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong, padding: 0 },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 14 },
  alsoTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong, marginBottom: 10 },
  applyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  applyTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: palette.textStrong },
  applySub: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: palette.text, marginTop: 1 },
});
