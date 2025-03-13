import axios from 'axios';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

const API_URL = 'http://localhost:8000';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },
  
  signup: async (credentials: SignupCredentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/auth/signup`, credentials);
    return response.data;
  },
  
  getMe: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}; 