import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

class VenueService {
  // Save/Update venue
  async saveVenue(venueData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.VENUE.SAVE, venueData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save venue');
    }
  }

  // Get venue details by user ID or venue ID
  async getVenueDetails(userId = null, venueId = null) {
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (venueId) params.venueId = venueId;
      
      const response = await apiService.get(API_ENDPOINTS.VENUE.GET_DETAILS, params);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get venue details');
    }
  }

  // Get venue names by user ID
  async getVenueNamesByUserId(userId) {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.VENUE.GET_NAMES_BY_USER_ID}/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get venue names');
    }
  }
}

export default new VenueService();