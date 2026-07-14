import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { UserProfile, BodyMeasurement } from '@/types/user';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(API_ENDPOINTS.user.profile);
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.patch<UserProfile>(API_ENDPOINTS.user.updateProfile, data);
  },

  async getMeasurements(): Promise<BodyMeasurement[]> {
    return apiClient.get<BodyMeasurement[]>(API_ENDPOINTS.user.measurements);
  },

  async addMeasurement(
    data: Omit<BodyMeasurement, 'id' | 'userId'>
  ): Promise<BodyMeasurement> {
    return apiClient.post<BodyMeasurement>(API_ENDPOINTS.user.measurements, data);
  },
};
