import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

class LeagueService {
  // Get league by identifier (email or username)
  async getLeagueByIdentifier(identifier) {
    try {
      const response = await apiService.post(API_ENDPOINTS.LEAGUE.GET_BY_IDENTIFIER, {
        identifier,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get league data');
    }
  }
}

export default new LeagueService();