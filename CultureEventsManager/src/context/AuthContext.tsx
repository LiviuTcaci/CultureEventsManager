import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types/models';
import { api } from '../services/api';
import { userService } from '../services/userService';
import { mockAuth } from '../services/mockData';

// Define the context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage on initial load
    const initAuth = async () => {
      const storedUser = userService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      try {
        // First try with real API
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        const { token, user } = response.data;
        
        // Save token and user in localStorage
        localStorage.setItem('token', token);
        userService.saveCurrentUser(user);
        
        // Update state
        setUser(user);
      } catch (apiError) {
        console.log('API login failed, falling back to mock auth:', apiError);
        
        // Fall back to mock auth if API fails
        const { token, user } = mockAuth.login(email, password);
        
        // Save token and user in localStorage
        localStorage.setItem('token', token);
        userService.saveCurrentUser(user);
        
        // Update state
        setUser(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      try {
        // First try with real API
        const response = await api.post<AuthResponse>('/auth/register', userData);
        const { token, user } = response.data;
        
        // Save token and user in localStorage
        localStorage.setItem('token', token);
        userService.saveCurrentUser(user);
        
        // Update state
        setUser(user);
      } catch (apiError) {
        console.log('API registration failed, falling back to mock auth:', apiError);
        
        // Fall back to mock auth if API fails
        const { token, user } = mockAuth.register(userData);
        
        // Save token and user in localStorage
        localStorage.setItem('token', token);
        userService.saveCurrentUser(user);
        
        // Update state
        setUser(user);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    userService.clearCurrentUser();
    
    // Update state
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
