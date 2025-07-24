// API Configuration
const API_BASE_URL = 'https://leagueaseappbackend-production.up.railway.app/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_USERNAME: '/auth/verify-username',
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CREATE_LEAGUE: '/auth/create-league',
  },
  
  // League endpoints
  LEAGUE: {
    GET_BY_IDENTIFIER: '/leaguease/get-leaguease-by-identifier',
  },
  
  // Tournament endpoints
  TOURNAMENT: {
    SAVE: '/tournament/save',
    GET_BY_USER_ID: '/tournament/get-tournament-by-User-Id',
    SAVE_TEAM: '/tournament/saveTeam',
    GET_TEAM_BY_USER_AND_TOURNAMENT: '/tournament/get-team-by-User-Id-and-tournament-Id',
    SAVE_PLAYER: '/tournament/savePlayer',
    GET_PLAYERS_BY_USER_AND_TEAM: '/tournament/get-players-by-userId-and-team',
  },
  
  // Match endpoints
  MATCH: {
    SAVE: '/match/saveMatch',
    GET_ALL_BY_USER_ID: '/match/get-all-matches-by-user-Id',
  },
  
  // Venue endpoints
  VENUE: {
    SAVE: '/venue/saveVenue',
    GET_DETAILS: '/venue/get-venue-details',
    GET_NAMES_BY_USER_ID: '/venue/get-venue-names',
  },
};

export default API_BASE_URL;