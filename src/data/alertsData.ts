import { AlertItem, ChartPoint } from './types';

const generateChartData = (baseValue: number, points: number = 160): ChartPoint[] => {
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: Math.max(0, baseValue + Math.sin(i * 0.1) * 15 + (Math.random() - 0.5) * 10),
    timestamp: Date.now() - (points - i) * 3600000,
  }));
};

export const mockAlerts: AlertItem[] = [
  {
    id: '1',
    title: 'PM2.5 exceeded threshold',
    description: 'Reached 39 µg/m³, above the 35 µg/m³ unhealthy cutoff. Ventilation recommended.',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    level: 'unhealthy',
    value: 39,
    roomId: 'room-204',
    roomName: 'Room 204 · Main Library',
    acknowledged: false,
    resolved: false,
    threshold: 35,
    actualValue: 39,
    unit: 'µg/m³',
    chartData: generateChartData(39),
    notified: true,
  },
  {
    id: '2',
    title: 'CO₂ elevated',
    description: '812 ppm sustained for 40 min — indicates reduced fresh-air exchange.',
    timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
    level: 'moderate',
    value: 812,
    roomId: 'room-204',
    roomName: 'Room 204 · Main Library',
    acknowledged: false,
    resolved: false,
    threshold: 800,
    actualValue: 812,
    unit: 'ppm',
    chartData: generateChartData(812),
    notified: false,
  },
  {
    id: '3',
    title: 'Air quality restored',
    description: 'PM2.5 returned to Good range after purifier ran on High for 22 min.',
    timestamp: new Date('2024-03-12T19:42:00Z').toISOString(),
    level: 'good',
    value: 12.2,
    roomId: 'room-204',
    roomName: 'Room 204 · Main Library',
    acknowledged: true,
    resolved: true,
    resolvedAt: '2024-03-12T19:42:00Z',
    threshold: 35,
    actualValue: 12.2,
    unit: 'µg/m³',
    chartData: generateChartData(12),
    notified: true,
  },
  {
    id: '4',
    title: 'VOC spike detected',
    description: 'Index jumped to 210 — likely cleaning agents. Occupants notified.',
    timestamp: new Date('2024-03-12T14:15:00Z').toISOString(),
    level: 'veryUnhealthy',
    value: 210,
    roomId: 'room-204',
    roomName: 'Room 204 · Main Library',
    acknowledged: false,
    resolved: false,
    threshold: 200,
    actualValue: 210,
    unit: 'ppb',
    chartData: generateChartData(210),
    notified: true,
  },
  {
    id: '5',
    title: 'PM10 threshold breached',
    description: 'PM10 reached 180 µg/m³ — construction dust likely. Filters need checking.',
    timestamp: new Date('2024-03-11T16:30:00Z').toISOString(),
    level: 'unhealthy',
    value: 180,
    roomId: 'room-204',
    roomName: 'Room 204 · Main Library',
    acknowledged: true,
    resolved: true,
    resolvedAt: '2024-03-11T16:45:00Z',
    threshold: 150,
    actualValue: 180,
    unit: 'µg/m³',
    chartData: generateChartData(180),
    notified: true,
  },
];

export const getAlerts = (): AlertItem[] => mockAlerts;

export const getAlertById = (id: string): AlertItem | undefined => mockAlerts.find(a => a.id === id);

export const getAlertsByLevel = (level: AlertItem['level']): AlertItem[] => mockAlerts.filter(a => a.level === level);

export const getActiveAlerts = (): AlertItem[] => mockAlerts.filter(a => !a.resolved && a.level !== 'good');

export const getResolvedAlerts = (): AlertItem[] => mockAlerts.filter(a => a.resolved || a.level === 'good');

export const acknowledgeAlert = (id: string): AlertItem | undefined => {
  const alert = mockAlerts.find(a => a.id === id);
  if (alert) alert.acknowledged = true;
  return alert;
};

export const resolveAlert = (id: string, note?: string, notified?: boolean): AlertItem | undefined => {
  const alert = mockAlerts.find(a => a.id === id);
  if (alert) {
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    if (note) alert.note = note;
    if (notified !== undefined) alert.notified = notified;
  }
  return alert;
};

export const getAlertSummary = () => {
  const active = getActiveAlerts();
  const byLevel = active.reduce((acc, a) => { acc[a.level] = (acc[a.level] || 0) + 1; return acc; }, {} as Record<string, number>);
  return { total: mockAlerts.length, active: active.length, resolved: getResolvedAlerts().length, byLevel };
};