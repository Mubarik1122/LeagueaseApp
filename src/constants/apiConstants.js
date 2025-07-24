// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  LEAGUE_DATA: 'leagueData',
  SIGNUP_EMAIL: 'signupEmail',
  SIGNUP_LANGUAGE: 'signupLanguage',
  SELECTED_SPORT: 'selectedSport',
  LEAGUE_DETAILS: 'leagueDetails',
  WEBSITE_URL: 'websiteUrl',
  SUBSCRIPTION: 'subscription',
};

// Tournament Types
export const TOURNAMENT_TYPES = {
  DIVISION: 'Division',
  TOURNAMENT: 'Tournament',
  LEAGUE: 'League',
};

// Match Status
export const MATCH_STATUS = {
  NORMAL: 'Normal',
  CANCELLED: 'Cancelled',
  POSTPONED: 'Postponed',
  COMPLETED: 'Completed',
};

// Player Registration Status
export const REGISTRATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
};

// User Roles
export const USER_ROLES = {
  PLAYER: 'Player',
  ADMIN: 'Administrator',
  TEAM_MANAGER: 'Team Manager',
  REFEREE: 'Referee',
  LEAGUE_ADMIN: 'League Administrator',
};