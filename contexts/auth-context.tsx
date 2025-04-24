'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse, LoginCredentials, SignupCredentials, authApi, isTokenExpiringSoon } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
  getToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for token in cookies on mount
    const storedToken = Cookies.get('token')
    if (storedToken) {
      setToken(storedToken)
      
      // Check if token is expiring soon
      if (isTokenExpiringSoon(storedToken)) {
        // Token is expiring soon, refresh it
        authApi.getMe(storedToken)
          .then(response => {
            // Update both token and user data from the response
            setToken(response.access_token)
            setUser(response.user)
            
            // Update the token in cookies with the refreshed token
            Cookies.set('token', response.access_token, { expires: 1 })
            
            // If we're on an auth page, redirect to dashboard
            if (window.location.pathname.startsWith('/login') || 
                window.location.pathname.startsWith('/signup')) {
              router.push('/')
            }
          })
          .catch(() => {
            // If token is invalid, clear everything
            Cookies.remove('token')
            setToken(null)
            setUser(null)
            router.push('/login')
          })
          .finally(() => setIsLoading(false))
      } else {
        // Token is still valid, just get user data
        authApi.getUserData(storedToken)
          .then(userData => {
            setUser(userData)
            
            // If we're on an auth page, redirect to dashboard
            if (window.location.pathname.startsWith('/login') || 
                window.location.pathname.startsWith('/signup')) {
              router.push('/')
            }
          })
          .catch(() => {
            // If token is invalid, clear everything
            Cookies.remove('token')
            setToken(null)
            setUser(null)
            router.push('/login')
          })
          .finally(() => setIsLoading(false))
      }
    } else {
      setIsLoading(false)
      // If no token and not on auth page, redirect to login
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/signup')) {
        router.push('/login')
      }
    }
  }, [router])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authApi.login(credentials)
      setToken(response.access_token)
      setUser(response.user)
      // Set cookie with token (expires in 24 hours)
      Cookies.set('token', response.access_token, { expires: 1 })
      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    try {
      await authApi.signup(credentials)
      // After successful signup, log the user in
      await login({
        email: credentials.email,
        password: credentials.password
      })
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const getToken = async (): Promise<string> => {
    // If we already have a token, return it
    if (token) {
      // Check if token is expiring soon
      if (isTokenExpiringSoon(token)) {
        try {
          // Token is expiring soon, refresh it
          const response = await authApi.getMe(token)
          // Update both token and user data from the response
          setToken(response.access_token)
          setUser(response.user)
          
          // Update the token in cookies with the refreshed token
          Cookies.set('token', response.access_token, { expires: 1 })
          
          return response.access_token
        } catch (error) {
          // If token refresh fails, clear everything and redirect to login
          Cookies.remove('token')
          setToken(null)
          setUser(null)
          router.push('/login')
          toast.error('Your session has expired. Please log in again.')
          return ''
        }
      }
      return token
    }
    
    // If no token, check cookies
    const storedToken = Cookies.get('token')
    if (storedToken) {
      setToken(storedToken)
      return storedToken
    }
    
    // If no token in cookies, redirect to login
    router.push('/login')
    throw new Error('No token available')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 