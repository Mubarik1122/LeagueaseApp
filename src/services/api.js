import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add interceptor to include the token in requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Authentication methods
export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user')
};

// Leagues API
export const leaguesAPI = {
  getAll: () => api.get('/leagues'),
  getOne: (id) => api.get(`/leagues/${id}`),
  create: (data) => api.post('/leagues', data),
  update: (id, data) => api.put(`/leagues/${id}`, data),
  delete: (id) => api.delete(`/leagues/${id}`)
};

// Teams API
export const teamsAPI = {
  getAll: (leagueId) => api.get('/teams', { params: { league_id: leagueId } }),
  getOne: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`)
};

// Players API
export const playersAPI = {
  getAll: () => api.get('/players'),
  getByTeam: (teamId) => api.get(`/teams/${teamId}/players`),
  getOne: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`)
};

// Matches API
export const matchesAPI = {
  getAll: (leagueId) => api.get('/matches', { params: { league_id: leagueId } }),
  getOne: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  updateScore: (id, data) => api.put(`/matches/${id}/score`, data),
  delete: (id) => api.delete(`/matches/${id}`)
};

export default api;
