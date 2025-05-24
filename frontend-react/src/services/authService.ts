// Define interfaces for auth data types
export interface Credentials {
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
  message?: string;
}

export interface RegisterData extends Credentials {
  confirmPassword?: string;
}

// Use VITE_API_BASE_URL or fallback to '/api' for relative path
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Login user
const loginUser = async (credentials: { email: string; password: string }): Promise<any> => {
  console.log('Login request payload:', JSON.stringify(credentials));
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
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
const registerUser = async (userData: { email: string; password: string }): Promise<any> => {
  console.log('Register request payload:', JSON.stringify(userData));
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
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