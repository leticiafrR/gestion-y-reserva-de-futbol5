import axios from 'axios';
import { BASE_API_URL } from '@/config/app-query-client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async verifyEmail(token: string): Promise<string> {
    try {
      const response = await axios.get(`${BASE_API_URL}/users/verify`, {
        params: { token }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Error verifying email');
      }
      throw error;
    }
  }
}

export const authService = new AuthService(); 