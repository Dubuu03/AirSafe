export type AirLevel = 'good' | 'moderate' | 'bad' | 'unhealthy' | 'veryUnhealthy' | 'critical' | 'hazardous';

export type AlertLevel = 'good' | 'moderate' | 'unhealthy' | 'veryUnhealthy';

export interface DayReport {
  day: string;
  value: number;
  level: AirLevel;
  date: string;
  timestamp?: number;
  pm25: number;
  temp: number;
  humidity: number;
  co2: number;
  co: number;
  voc: number;
  nox: number;
}

export interface HomeData {
  name: string;
  location: string;
  score: number;
  level: AirLevel;
  temp: number;
  humidity: number;
  co2: number;
  co: number;
  voc: number;
  nox: number;
  weekly: DayReport[];
  pm25: number;
  pm10: number;
  aqi: number;
  lastUpdated: string;
}

export interface StatItem {
  label: string;
  value: number;
  unit: string;
  level: AirLevel;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  level: AlertLevel;
  value: number;
  roomId: string;
  roomName: string;
  acknowledged: boolean;
  resolved: boolean;
  resolvedAt?: string;
  note?: string;
  notified: boolean;
  threshold: number;
  actualValue: number;
  unit: string;
  chartData?: ChartPoint[];
}

export interface ChartPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface TrendData {
  co2: ChartPoint[];
  pm25: ChartPoint[];
  voc: ChartPoint[];
  co: ChartPoint[];
  temp: ChartPoint[];
  humidity: ChartPoint[];
  nox: ChartPoint[];
  period: 'day' | 'week' | 'month';
  summary: {
    co2: { avg: number; min: number; max: number };
    pm25: { avg: number; min: number; max: number };
    voc: { avg: number; min: number; max: number };
    co: { avg: number; min: number; max: number };
    temp: { avg: number; min: number; max: number };
    humidity: { avg: number; min: number; max: number };
    nox: { avg: number; min: number; max: number };
  };
}

export interface ThresholdConfig {
  pm25: { warning: number; unhealthy: number; critical: number };
  pm10: { warning: number; unhealthy: number; critical: number };
  co2: { warning: number; unhealthy: number; critical: number };
  voc: { warning: number; unhealthy: number; critical: number };
  applyToAllRooms: boolean;
  rooms: string[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  location: string;
  sensors: SensorInfo[];
}

export interface SensorInfo {
  type: 'pm25' | 'pm10' | 'co2' | 'co' | 'voc' | 'nox' | 'temperature' | 'humidity';
  value: number;
  unit: string;
  lastCalibrated: string;
  status: 'ok' | 'warning' | 'error';
}

export interface NotificationSettings {
  pushEnabled: boolean;
  dailySummary: boolean;
  autoPurifierTrigger: boolean;
  alertThresholds: {
    pm25: boolean;
    pm10: boolean;
    co2: boolean;
    voc: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  preferences: {
    units: 'metric' | 'imperial';
    language: string;
    timezone: string;
  };
  notificationSettings: NotificationSettings;
}

export interface RoomInfo {
  id: string;
  name: string;
  floor: number;
  area: number;
  deviceId: string;
  thresholds?: Partial<ThresholdConfig>;
  occupancy?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}