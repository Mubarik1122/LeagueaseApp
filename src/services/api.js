// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://leagueaseappbackend-production.up.railway.app/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errorMessage || "API request failed");
  }

  return data;
};

// Auth API functions
export const authAPI = {
  requestOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(response);
  },

  verifyUsername: async (username) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (identifier, password, leagueId = null) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, leagueId }),
    });
    return handleResponse(response);
  },

  forgotPassword: async (email, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    return handleResponse(response);
  },

  createLeague: async (leagueData) => {
    const response = await fetch(`${API_BASE_URL}/auth/create-league`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leagueData),
    });
    return handleResponse(response);
  },
};

// League API functions
export const leagueAPI = {
  getLeagueByIdentifier: async (identifier) => {
    const response = await fetch(
      `${API_BASE_URL}/leaguease/get-leaguease-by-identifier`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      }
    );
    return handleResponse(response);
  },
};

// Tournament API functions
export const tournamentAPI = {
  save: async (tournamentData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tournamentData),
    });
    return handleResponse(response);
  },

  getByUserId: async (userId) => {
    const response = await fetch(
      `${API_BASE_URL}/tournament/get-tournament-by-User-Id?userId=${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Team API functions
export const teamAPI = {
  save: async (teamData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/saveTeam`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  getByUserIdAndTournamentId: async (userId, tournamentId) => {
    const response = await fetch(
      `${API_BASE_URL}/tournament/get-team-by-User-Id-and-tournament-Id?userId=${userId}&tournamentId=${tournamentId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Player API functions
export const playerAPI = {
  save: async (playerData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/savePlayer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(playerData),
    });
    return handleResponse(response);
  },

  getByUserIdAndTeam: async (userId, teamId) => {
    const response = await fetch(
      `${API_BASE_URL}/tournament/get-players-by-userId-and-team?userId=${userId}&teamId=${teamId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Match API functions
export const matchAPI = {
  save: async (matchData) => {
    const response = await fetch(`${API_BASE_URL}/match/saveMatch`, {
      method: "POST",
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
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Venue API functions
export const venueAPI = {
  save: async (venueData) => {
    const response = await fetch(`${API_BASE_URL}/venue/saveVenue`, {
      method: "POST",
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
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNamesByUserId: async (userId) => {
    const response = await fetch(
      `${API_BASE_URL}/venue/get-venue-names/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};
