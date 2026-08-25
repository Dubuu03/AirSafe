import { DeviceInfo, SensorInfo, ThresholdConfig, RoomInfo } from './types';

export const mockDevice: DeviceInfo = {
  id: 'dev-emb-001',
  name: 'EMB Cagayan Valley Monitor',
  model: 'AirSafe Pro 2.0',
  firmware: 'v2.4.1',
  status: 'online',
  lastSeen: new Date().toISOString(),
  location: 'EMB Cagayan Valley',
  sensors: [
    { type: 'pm25', value: 12.2, unit: 'µg/m³', lastCalibrated: '2024-01-15', status: 'ok' },
    { type: 'pm10', value: 18.5, unit: 'µg/m³', lastCalibrated: '2024-01-15', status: 'ok' },
    { type: 'co2', value: 412, unit: 'ppm', lastCalibrated: '2024-01-10', status: 'ok' },
    { type: 'voc', value: 45, unit: 'ppb', lastCalibrated: '2024-01-10', status: 'ok' },
    { type: 'temperature', value: 30, unit: '°C', lastCalibrated: '2024-01-20', status: 'ok' },
    { type: 'humidity', value: 61, unit: '%', lastCalibrated: '2024-01-20', status: 'ok' },
  ],
};

export const defaultThresholds: ThresholdConfig = {
  pm25: { warning: 25, unhealthy: 35, critical: 75 },
  pm10: { warning: 50, unhealthy: 150, critical: 250 },
  co2: { warning: 800, unhealthy: 1000, critical: 1500 },
  voc: { warning: 100, unhealthy: 200, critical: 400 },
  applyToAllRooms: false,
  rooms: ['room-204'],
};

export const mockRooms: RoomInfo[] = [
  { id: 'room-204', name: 'Main Library', floor: 2, area: 120, deviceId: 'dev-emb-001', occupancy: 45, thresholds: defaultThresholds },
  { id: 'room-101', name: 'Conference Room A', floor: 1, area: 45, deviceId: 'dev-emb-002', occupancy: 12 },
  { id: 'room-102', name: 'Conference Room B', floor: 1, area: 40, deviceId: 'dev-emb-003', occupancy: 10 },
];

export const appVersion = '1.0.0';
export const buildNumber = '2024.03.12.001';

export const getDeviceInfo = (): DeviceInfo => mockDevice;
export const getThresholds = (): ThresholdConfig => defaultThresholds;
export const getRooms = (): RoomInfo[] => mockRooms;

export const updateThresholds = (thresholds: Partial<ThresholdConfig>): ThresholdConfig => ({ ...defaultThresholds, ...thresholds });