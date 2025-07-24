import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

class MatchService {
  // Save/Update match
  async saveMatch(matchData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.MATCH.SAVE, matchData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save match');
    }
  }

  // Get all matches by user ID
  async getAllMatchesByUserId(userId, matchId = null) {
    try {
      const params = { userId };
      if (matchId) {
        params.matchId = matchId;
      }
      
      const response = await apiService.get(API_ENDPOINTS.MATCH.GET_ALL_BY_USER_ID, params);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get matches');
    }
  }
}

export default new MatchService();