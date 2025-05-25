import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { 
  loginUser, registerUser, logout as logoutService, 
  isAuthenticated as checkAuth, getUser as getUserData,
  UserData
} from '../services/authService';

// Use UserData interface from auth service
export interface User extends UserData {}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Create provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = checkAuth();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const userData = getUserData();
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();
    
    // Listen for storage events (logout in other tabs)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Login function
  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      const response = await loginUser({ identifier, password });
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await registerUser({ username, email, password });
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    logoutService();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Create context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  // Provide context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};