import api from './axios'

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  is_active: boolean
}

export interface UserCreate {
  email: string
  full_name: string
  role: string
  password: string
}

export interface UserUpdate {
  email?: string
  full_name?: string
  role?: string
  is_active?: boolean
  password?: string
}

export const usersApi = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/')
    return response.data
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  // Create new user
  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/users/', userData)
    return response.data
  },

  // Update user
  updateUser: async (userId: string, userData: UserUpdate): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`)
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response.data
  }
} 