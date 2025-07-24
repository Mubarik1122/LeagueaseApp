import apiService from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

class TournamentService {
  // Save/Update tournament
  async saveTournament(tournamentData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.TOURNAMENT.SAVE, tournamentData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save tournament');
    }
  }

  // Get tournaments by user ID
  async getTournamentsByUserId(userId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.TOURNAMENT.GET_BY_USER_ID, {
        userId,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get tournaments');
    }
  }

  // Save/Update team
  async saveTeam(teamData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.TOURNAMENT.SAVE_TEAM, teamData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save team');
    }
  }

  // Get teams by user ID and tournament ID
  async getTeamsByUserAndTournament(userId, tournamentId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.TOURNAMENT.GET_TEAM_BY_USER_AND_TOURNAMENT, {
        userId,
        tournamentId,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get teams');
    }
  }

  // Save/Update player
  async savePlayer(playerData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.TOURNAMENT.SAVE_PLAYER, playerData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save player');
    }
  }

  // Get players by user ID and team ID
  async getPlayersByUserAndTeam(userId, teamId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.TOURNAMENT.GET_PLAYERS_BY_USER_AND_TEAM, {
        userId,
        teamId,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get players');
    }
  }
}

export default new TournamentService();