import { HomeData, DayReport, AirLevel } from './types';

const baseWeekly: DayReport[] = [
  { day: 'Friday', value: 60.6, level: 'bad', date: '2024-03-08', pm25: 60.6, temp: 30, humidity: 55, co2: 920, co: 3.8, voc: 110, nox: 35 },
  { day: 'Saturday', value: 150.7, level: 'critical', date: '2024-03-09', pm25: 150.7, temp: 32, humidity: 48, co2: 1200, co: 5.2, voc: 180, nox: 52 },
  { day: 'Sunday', value: 11.3, level: 'good', date: '2024-03-10', pm25: 11.3, temp: 26, humidity: 68, co2: 650, co: 1.5, voc: 45, nox: 15 },
  { day: 'Monday', value: 16.2, level: 'good', date: '2024-03-11', pm25: 16.2, temp: 27, humidity: 64, co2: 720, co: 2.0, voc: 55, nox: 18 },
  { day: 'Tuesday', value: 22.4, level: 'good', date: '2024-03-12', pm25: 22.4, temp: 29, humidity: 58, co2: 800, co: 2.6, voc: 72, nox: 24 },
  { day: 'Wednesday', value: 35.1, level: 'moderate', date: '2024-03-13', pm25: 35.1, temp: 31, humidity: 52, co2: 950, co: 3.5, voc: 95, nox: 32 },
  { day: 'Thursday', value: 42.8, level: 'bad', date: '2024-03-14', pm25: 42.8, temp: 30, humidity: 50, co2: 1000, co: 4.0, voc: 105, nox: 38 },
];

export const mockHomeData: HomeData = {
  name: 'RJ',
  location: 'EMB Cagayan Valley',
  score: 12.2,
  level: 'good',
  temp: 28,
  humidity: 62,
  co2: 850,
  co: 2.4,
  voc: 85,
  nox: 22,
  weekly: baseWeekly,
  pm25: 12.2,
  pm10: 18.5,
  aqi: 15,
  lastUpdated: new Date().toISOString(),
};

export const getMockHomeData = (): HomeData => mockHomeData;