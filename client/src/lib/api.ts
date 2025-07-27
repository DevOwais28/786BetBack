import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  register: (userData: { email: string; password: string; username: string }) =>
    api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: () => api.post('/api/auth/refresh'),
};

export const walletAPI = {
  getBalance: () => api.get('/api/wallet'),
  getPaymentDetails: () => api.get('/api/deposit/payment-details'),
  createDeposit: (data: FormData) => api.post('/api/deposit', data),
  createWithdrawal: (data: { amount: number; method: string; accountDetails: string }) =>
    api.post('/api/withdrawal', data),
  uploadProof: (data: FormData) => api.post('/api/deposit/upload-proof', data),
};

export const userAPI = {
  getProfile: () => api.get('/api/profile/me'),
  updateProfile: (data: any) => api.patch('/api/profile/me', data),
  getBetsHistory: () => api.get('/api/bets/history'),
  getUserStats: () => api.get('/api/user/stats'),
};

export const gameAPI = {
  getGames: () => api.get('/api/games'),
  placeBet: (data: { amount: number; multiplier: number; gameId: string }) =>
    api.post('/api/games/bet', data),
  cashOut: (betId: string) => api.post(`/api/games/cash-out/${betId}`),
};

export default api;
