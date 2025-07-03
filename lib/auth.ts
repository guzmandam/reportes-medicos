import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

export interface JwtPayload {
  sub: string;
  exp: number;
  [key: string]: any;
}

const API_URL = `http://backend:8000/api/v1`

// Check if token is close to expiration (less than 5 minutes remaining)
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return expirationTime - currentTime < fiveMinutesInMs;
  } catch (error) {
    // If token is invalid, consider it expired
    return true;
  }
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },
  
  signup: async (credentials: SignupCredentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/auth/signup`, credentials);
    return response.data;
  },
  
  getMe: async (token: string): Promise<AuthResponse> => {
    const response = await axios.get(`${API_URL}/auth/token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  // New function to get user data without refreshing token
  getUserData: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}; 