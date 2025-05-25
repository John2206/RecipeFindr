// Define interfaces for auth data types
export interface Credentials {
  username?: string;  // Optional for login (can use email instead)
  email: string;
  password: string;
}

export interface LoginCredentials {
  identifier: string;  // Can be username or email
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
  message?: string;
}

// Import centralized configuration
import { appConfig } from '../config/app';

// Use centralized API configuration
const API_BASE = `${appConfig.apiBaseUrl}/api`;

// Token handling utilities
const getAuthToken = (): string | null => localStorage.getItem('authToken');
const setAuthToken = (token: string): void => localStorage.setItem('authToken', token);
const removeAuthToken = (): void => localStorage.removeItem('authToken');

// User data handling utilities
const getUserData = (): any => {
  const userStr = localStorage.getItem('userData');
  return userStr ? JSON.parse(userStr) : null;
};
const setUserData = (user: any): void => localStorage.setItem('userData', JSON.stringify(user));
const removeUserData = (): void => localStorage.removeItem('userData');

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000;
  } catch (e) {
    return false;
  }
};

// Login user - accepts either username or email as identifier
const loginUser = async (credentials: LoginCredentials): Promise<any> => {
  const loginPayload = {
    // Determine if identifier is email (contains @) or username
    ...(credentials.identifier.includes('@') 
      ? { email: credentials.identifier } 
      : { username: credentials.identifier }
    ),
    password: credentials.password
  };
  
  console.log('Login request payload:', JSON.stringify(loginPayload));
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginPayload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  setAuthToken(data.token);
  setUserData(data.user);
  return data;
};

// Register user
const registerUser = async (userData: RegisterData): Promise<any> => {
  const registerPayload = {
    username: userData.username,
    email: userData.email,
    password: userData.password
  };
  
  console.log('Register request payload:', JSON.stringify(registerPayload));
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerPayload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  if (data.token && data.user) {
    setAuthToken(data.token);
    setUserData(data.user);
  }
  return data;
};

// Logout user
const logout = (): void => {
  removeAuthToken();
  removeUserData();
};

// Get user helper
const getUser = (): any => {
  return getUserData();
};

// Get auth headers helper
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export {
  loginUser,
  registerUser,
  logout,
  isAuthenticated,
  getUser,
  getAuthHeaders
};