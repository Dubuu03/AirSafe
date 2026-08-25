import { UserProfile, NotificationSettings } from './types';

export const mockNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  dailySummary: true,
  autoPurifierTrigger: false,
  alertThresholds: { pm25: true, pm10: true, co2: true, voc: true },
};

export const mockUserProfile: UserProfile = {
  id: 'user-001',
  name: 'RJ Dela Cruz',
  email: 'rj.delacruz@emb.gov.ph',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rj',
  role: 'admin',
  preferences: { units: 'metric', language: 'en', timezone: 'Asia/Manila' },
  notificationSettings: mockNotificationSettings,
};

export const getUserProfile = (): UserProfile => mockUserProfile;
export const updateUserProfile = (profile: Partial<UserProfile>): UserProfile => ({ ...mockUserProfile, ...profile });

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}