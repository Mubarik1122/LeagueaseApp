import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

class AuthService {
  // Request OTP
  async requestOTP(email) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REQUEST_OTP, {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to request OTP');
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  // Verify username availability
  async verifyUsername(username) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_USERNAME, {
        username,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to verify username');
    }
  }

  // Sign up
  async signup(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  // Login
  async login(identifier, password, leagueId = null) {
    try {
      const loginData = { identifier, password };
      if (leagueId) {
        loginData.leagueId = leagueId;
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      
      if (response.token) {
        apiService.setAuthToken(response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to login');
    }
  }

  // Forgot password
  async forgotPassword(email, newPassword) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
        newPassword,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Create league
  async createLeague(leagueData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.CREATE_LEAGUE, leagueData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create league');
    }
  }

  // Logout
  logout() {
    apiService.removeAuthToken();
    localStorage.removeItem('userData');
    localStorage.removeItem('leagueData');
  }

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.token && !!this.getCurrentUser();
  }
}

export default new AuthService();