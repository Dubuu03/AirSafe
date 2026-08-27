import { TrendData, ChartPoint } from './types';

const generatePeriodData = (period: 'day' | 'week' | 'month', baseValue: number, variance: number): ChartPoint[] => {
  const points = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  const interval = period === 'day' ? 3600000 : period === 'week' ? 86400000 : 86400000;
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: Math.max(0, baseValue + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.8)),
    timestamp: Date.now() - (points - i) * interval,
  }));
};

const calculateSummary = (data: ChartPoint[]) => {
  const values = data.map(d => d.y).filter(v => v > 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { avg: Math.round(avg * 10) / 10, min: Math.round(min * 10) / 10, max: Math.round(max * 10) / 10 };
};

export const mockTrendData: Record<'day' | 'week' | 'month', TrendData> = {
  day: {
    period: 'day',
    co2: generatePeriodData('day', 420, 80),
    pm25: generatePeriodData('day', 25, 15),
    voc: generatePeriodData('day', 60, 25),
    co: generatePeriodData('day', 2.5, 1.5),
    temp: generatePeriodData('day', 28, 3),
    humidity: generatePeriodData('day', 62, 8),
    nox: generatePeriodData('day', 22, 10),
    summary: {
      co2: { avg: 420, min: 380, max: 480 },
      pm25: { avg: 25, min: 15, max: 40 },
      voc: { avg: 60, min: 35, max: 90 },
      co: { avg: 2.5, min: 1.2, max: 4.0 },
      temp: { avg: 28, min: 24, max: 32 },
      humidity: { avg: 62, min: 52, max: 72 },
      nox: { avg: 22, min: 12, max: 35 },
    },
  },
  week: {
    period: 'week',
    co2: generatePeriodData('week', 450, 100),
    pm25: generatePeriodData('week', 30, 20),
    voc: generatePeriodData('week', 70, 30),
    co: generatePeriodData('week', 3.0, 1.8),
    temp: generatePeriodData('week', 27, 4),
    humidity: generatePeriodData('week', 60, 10),
    nox: generatePeriodData('week', 25, 12),
    summary: {
      co2: { avg: 450, min: 380, max: 550 },
      pm25: { avg: 30, min: 18, max: 55 },
      voc: { avg: 70, min: 40, max: 110 },
      co: { avg: 3.0, min: 1.5, max: 5.0 },
      temp: { avg: 27, min: 22, max: 33 },
      humidity: { avg: 60, min: 48, max: 75 },
      nox: { avg: 25, min: 14, max: 40 },
    },
  },
  month: {
    period: 'month',
    co2: generatePeriodData('month', 440, 120),
    pm25: generatePeriodData('month', 35, 25),
    voc: generatePeriodData('month', 75, 35),
    co: generatePeriodData('month', 2.8, 2.0),
    temp: generatePeriodData('month', 27, 5),
    humidity: generatePeriodData('month', 58, 12),
    nox: generatePeriodData('month', 24, 14),
    summary: {
      co2: { avg: 440, min: 350, max: 580 },
      pm25: { avg: 35, min: 15, max: 65 },
      voc: { avg: 75, min: 35, max: 120 },
      co: { avg: 2.8, min: 1.0, max: 5.5 },
      temp: { avg: 27, min: 20, max: 35 },
      humidity: { avg: 58, min: 42, max: 78 },
      nox: { avg: 24, min: 10, max: 45 },
    },
  },
};

export const getTrendData = (period: 'day' | 'week' | 'month' = 'day'): TrendData => mockTrendData[period];

export const getTodaySummary = () => {
  const day = mockTrendData.day;
  return {
    co2: { value: day.co2[day.co2.length - 1]?.y || 0, unit: 'ppm', level: 'good' as const },
    pm25: { value: day.pm25[day.pm25.length - 1]?.y || 0, unit: 'µg/m³', level: 'good' as const },
    voc: { value: day.voc[day.voc.length - 1]?.y || 0, unit: 'ppb', level: 'good' as const },
    avgAQI: Math.round((day.summary.co2.avg / 10 + day.summary.pm25.avg * 2 + day.summary.voc.avg / 5) / 3),
  };
};

export const getXLabels = (period: 'day' | 'week' | 'month'): string[] => {
  if (period === 'day') return ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
  if (period === 'week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
};

export const getYDomain = (period: 'day' | 'week' | 'month') => {
  const data = mockTrendData[period];
  const allValues = [...data.co2, ...data.pm25, ...data.voc].map(d => d.y);
  const min = Math.floor(Math.min(...allValues) / 50) * 50;
  const max = Math.ceil(Math.max(...allValues) / 50) * 50;
  return { min: Math.max(0, min - 50), max: max + 50 };
};
