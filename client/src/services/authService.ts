import axios from 'axios';

// Get server port from environment or use default
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || '5001';
const API_BASE_URL = process.env.REACT_APP_API_URL || `http://localhost:${SERVER_PORT}/api`;

console.log('🔧 AuthService Debug - Environment variables:');
console.log('🔧 AuthService Debug - REACT_APP_SERVER_PORT:', process.env.REACT_APP_SERVER_PORT);
console.log('🔧 AuthService Debug - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔧 AuthService Debug - SERVER_PORT (used):', SERVER_PORT);
console.log('🔧 AuthService Debug - API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔧 AuthService Debug - Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    headers: config.headers,
    data: config.data
  });
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('🔧 AuthService Debug - Response Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('🔧 AuthService Debug - Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔧 AuthService Debug - Login attempt for:', email);
    const response = await api.post('/users/login', { email, password });
    return response.data.data;
  },

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    console.log('🔧 AuthService Debug - Register attempt for:', { username, email });
    try {
      const response = await api.post('/users/register', { username, email, password });
      console.log('🔧 AuthService Debug - Register success:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('🔧 AuthService Debug - Register error:', error);
      throw error;
    }
  },

  async getProfile(token: string) {
    const response = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async updateProfile(data: { username?: string; email?: string }) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/account');
    return response.data;
  },
}; 