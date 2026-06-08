import { useState, useEffect, useRef } from 'react';
import { tournamentAPI, teamAPI, playerAPI, matchAPI } from '../services/api';

function normalizeTournamentList(data) {
  if (Array.isArray(data)) return data;
  if (data == null) return [];
  if (typeof data === 'object') return [data];
  return [];
}

export const useTournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchGuardRef = useRef({
    inFlightUserId: null,
    lastCallUserId: null,
    lastCallAt: 0,
  });

  const fetchTournaments = async (userId, options = {}) => {
    if (!userId) return;
    const force = Boolean(options.force);

    // React 18 StrictMode (dev) can invoke effects twice.
    // Avoid duplicate API calls for the same userId in quick succession.
    const now = Date.now();
    const guard = fetchGuardRef.current;
    const isInFlightSameUser = guard.inFlightUserId === userId;
    const isSameUserRecent =
      guard.lastCallUserId === userId && now - guard.lastCallAt < 1200;

    if (!force && isInFlightSameUser) return;
    if (!force && isSameUserRecent) return;

    guard.inFlightUserId = userId;
    guard.lastCallUserId = userId;
    guard.lastCallAt = now;

    setLoading(true);
    setError(null);
    
    try {
      const response = await tournamentAPI.getByUserId(userId);
      if (Number(response.errorCode) === 0) {
        setTournaments(normalizeTournamentList(response.data));
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchGuardRef.current.inFlightUserId = null;
    }
  };

  const saveTournament = async (tournamentData) => {
    try {
      const response = await tournamentAPI.save(tournamentData);
      if (response.errorCode === 0) {
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

  const fetchTeams = async (userId, tournamentId, options) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamAPI.getByUserIdAndTournamentId(
        userId,
        tournamentId,
        options
      );
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