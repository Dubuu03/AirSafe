import { Ionicons } from '@expo/vector-icons';

export type AirLevel = 'good' | 'bad' | 'critical';

export type DayReport = {
  day: string;
  value: string;
  level: AirLevel;
  icon: keyof typeof Ionicons.glyphMap;
};

export type HomeData = {
  greeting: string;
  name: string;
  date: string;
  location: string;
  score: string;
  level: AirLevel;
  message: string;
  weatherIcon: keyof typeof Ionicons.glyphMap;
  temp: string;
  humidity: string;
  rainfall: string;
  ventilation?: string;
  weekly: DayReport[];
};

export const goodData: HomeData = {
  greeting: 'GOOD MORNING',
  name: 'RJ',
  date: 'Tue, 12 Mar',
  location: 'EMB Cagayan Valley',
  score: '12.2',
  level: 'good',
  message: 'Air quality is safe. Have a nice day!',
  weatherIcon: 'partly-sunny-outline',
  temp: '30°C',
  humidity: '61%',
  rainfall: '4mm',
  weekly: [
    { day: 'Friday', value: '60.6µg/m³', level: 'bad', icon: 'cloudy-outline' },
    { day: 'Sunday', value: '11.3µg/m³', level: 'good', icon: 'partly-sunny-outline' },
    { day: 'Saturday', value: '150.7µg/m³', level: 'critical', icon: 'thunderstorm-outline' },
    { day: 'Monday', value: '16.2µg/m³', level: 'good', icon: 'partly-sunny-outline' },
  ],
};

export const badData: HomeData = {
  ...goodData,
  greeting: 'GOOD MORNING',
  score: '56.8',
  level: 'bad',
  message: 'Air quality is lower than normal.',
  weatherIcon: 'cloudy-outline',
  ventilation: 'Open windows or run purifier on Auto',
  weekly: [
    { day: 'Friday', value: '60.6µg/m³', level: 'bad', icon: 'cloudy-outline' },
    { day: 'Sunday', value: '11.3µg/m³', level: 'good', icon: 'partly-sunny-outline' },
    { day: 'Saturday', value: '150.7µg/m³', level: 'critical', icon: 'thunderstorm-outline' },
    { day: 'Monday', value: '16.2µg/m³', level: 'good', icon: 'partly-sunny-outline' },
  ],
};

export const criticalData: HomeData = {
  ...goodData,
  greeting: 'GOOD MORNING',
  score: '157.1',
  level: 'critical',
  message: 'Air quality is dangerous.',
  weatherIcon: 'cloud-outline',
  ventilation: 'Run purifier on High · notify facilities',
  weekly: [
    { day: 'Friday', value: '20.6µg/m³', level: 'good', icon: 'partly-sunny-outline' },
    { day: 'Sunday', value: '11.3µg/m³', level: 'good', icon: 'partly-sunny-outline' },
    { day: 'Saturday', value: '150.7µg/m³', level: 'critical', icon: 'thunderstorm-outline' },
    { day: 'Monday', value: '16.2µg/m³', level: 'good', icon: 'partly-sunny-outline' },
  ],
};
