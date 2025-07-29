// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    // Handle cases where response is not JSON
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  if (!response.ok) {
    throw new Error(data.errorMessage || 'API request failed');
  }
  
  return data;
};

// Helper function to make API requests with better error handling
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection or try again later.');
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  requestOTP: async (email) => {
    return await makeRequest(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOTP: async (email, otp) => {
    return await makeRequest(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  verifyUsername: async (username) => {
    return await makeRequest(`${API_BASE_URL}/auth/verify-username`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  signup: async (userData) => {
    return await makeRequest(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (identifier, password, leagueId = null) => {
    return await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier, password, leagueId }),
    });
  },

  forgotPassword: async (email, newPassword) => {
    return await makeRequest(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  createLeague: async (leagueData) => {
    return await makeRequest(`${API_BASE_URL}/auth/create-league`, {
      method: 'POST',
      body: JSON.stringify(leagueData),
    });
  },
};

// League API functions
export const leagueAPI = {
  getLeagueByIdentifier: async (identifier) => {
    return await makeRequest(`${API_BASE_URL}/leaguease/get-leaguease-by-identifier`, {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },
};

// Tournament API functions
export const tournamentAPI = {
  save: async (tournamentData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tournamentData),
    });
    return handleResponse(response);
  },

  getByUserId: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/tournament/get-tournament-by-User-Id?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Team API functions
export const teamAPI = {
  save: async (teamData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/saveTeam`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  getByUserIdAndTournamentId: async (userId, tournamentId) => {
    const response = await fetch(`${API_BASE_URL}/tournament/get-team-by-User-Id-and-tournament-Id?userId=${userId}&tournamentId=${tournamentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Player API functions
export const playerAPI = {
  save: async (playerData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/savePlayer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(playerData),
    });
    return handleResponse(response);
  },

  getByUserIdAndTeam: async (userId, teamId) => {
    const response = await fetch(`${API_BASE_URL}/tournament/get-players-by-userId-and-team?userId=${userId}&teamId=${teamId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Match API functions
export const matchAPI = {
  save: async (matchData) => {
    const response = await fetch(`${API_BASE_URL}/match/saveMatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(matchData),
    });
    return handleResponse(response);
  },

  getAllByUserId: async (userId, matchId = null) => {
    const url = matchId 
      ? `${API_BASE_URL}/match/get-all-matches-by-user-Id?userId=${userId}&matchId=${matchId}`
      : `${API_BASE_URL}/match/get-all-matches-by-user-Id?userId=${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Venue API functions
export const venueAPI = {
  save: async (venueData) => {
    const response = await fetch(`${API_BASE_URL}/venue/saveVenue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(venueData),
    });
    return handleResponse(response);
  },

  getDetails: async (userId, venueId = null) => {
    const url = venueId 
      ? `${API_BASE_URL}/venue/get-venue-details?userId=${userId}&venueId=${venueId}`
      : `${API_BASE_URL}/venue/get-venue-details?userId=${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNamesByUserId: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/venue/get-venue-names/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};