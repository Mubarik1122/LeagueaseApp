import { useState, useEffect } from 'react';
import { tournamentAPI, teamAPI, playerAPI, matchAPI } from '../services/api';

export const useTournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTournaments = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tournamentAPI.getByUserId(userId);
      if (response.errorCode === 0) {
        setTournaments(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTournament = async (tournamentData) => {
    try {
      const response = await tournamentAPI.save(tournamentData);
      if (response.errorCode === 0) {
        // Refresh tournaments list
        if (tournamentData.userId) {
          await fetchTournaments(tournamentData.userId);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    saveTournament,
  };
};

export const useTeam = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = async (userId, tournamentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamAPI.getByUserIdAndTournamentId(userId, tournamentId);
      if (response.errorCode === 0) {
        setTeams(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTeam = async (teamData) => {
    try {
      const response = await teamAPI.save(teamData);
      if (response.errorCode === 0) {
        // Refresh teams list
        if (teamData.userId && teamData.tournamentId) {
          await fetchTeams(teamData.userId, teamData.tournamentId);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    teams,
    loading,
    error,
    fetchTeams,
    saveTeam,
  };
};

export const usePlayer = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = async (userId, teamId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await playerAPI.getByUserIdAndTeam(userId, teamId);
      if (response.errorCode === 0) {
        setPlayers(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const savePlayer = async (playerData) => {
    try {
      const response = await playerAPI.save(playerData);
      if (response.errorCode === 0) {
        // Refresh players list
        if (playerData.userId && playerData.teamId) {
          await fetchPlayers(playerData.userId, playerData.teamId);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    players,
    loading,
    error,
    fetchPlayers,
    savePlayer,
  };
};

export const useMatch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatches = async (userId, matchId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await matchAPI.getAllByUserId(userId, matchId);
      if (response.errorCode === 0) {
        setMatches(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMatch = async (matchData) => {
    try {
      const response = await matchAPI.save(matchData);
      if (response.errorCode === 0) {
        // Refresh matches list
        if (matchData.userId) {
          await fetchMatches(matchData.userId);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    matches,
    loading,
    error,
    fetchMatches,
    saveMatch,
  };
};