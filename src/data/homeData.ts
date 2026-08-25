import { HomeData, DayReport, AirLevel } from './types';

const baseWeekly: DayReport[] = [
  { day: 'Friday', value: 60.6, level: 'bad', date: '2024-03-08' },
  { day: 'Saturday', value: 150.7, level: 'critical', date: '2024-03-09' },
  { day: 'Sunday', value: 11.3, level: 'good', date: '2024-03-10' },
  { day: 'Monday', value: 16.2, level: 'good', date: '2024-03-11' },
  { day: 'Tuesday', value: 22.4, level: 'good', date: '2024-03-12' },
  { day: 'Wednesday', value: 35.1, level: 'moderate', date: '2024-03-13' },
  { day: 'Thursday', value: 42.8, level: 'bad', date: '2024-03-14' },
];

export const mockHomeData: HomeData = {
  name: 'RJ',
  location: 'EMB Cagayan Valley',
  score: 12.2,
  level: 'good',
  temp: 30,
  humidity: 61,
  rainfall: 4,
  weekly: baseWeekly,
  pm25: 12.2,
  pm10: 18.5,
  co2: 412,
  voc: 45,
  aqi: 15,
  lastUpdated: new Date().toISOString(),
};

export const getMockHomeData = (): HomeData => mockHomeData;