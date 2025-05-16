// Define interfaces for auth data types
export interface Credentials {
  username: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
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
const AUTH_ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  register: `${API_BASE}/auth/register`
};

// Check if the token is valid and not expired
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Basic check if the token has at least 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // The JWT payload is encoded in base64, decode and check expiration
    const payload = JSON.parse(atob(parts[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expiryTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const loginUser = async (credentials: Credentials): Promise<AuthResponse> => {
  try {
    console.log('Login attempt with username:', credentials.username);
    
    const response = await fetch(AUTH_ENDPOINTS.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Login failed with status: ${response.status}` }));
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save authentication data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const { confirmPassword, ...registrationData } = userData;
    
    console.log('Register request payload:', JSON.stringify(registrationData));
    
    const response = await fetch(AUTH_ENDPOINTS.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Registration failed with status: ${response.status}` }));
      throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save authentication data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Helper function to get auth token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to get authenticated user from localStorage
export const getUser = (): UserData | null => {
  const userStr = localStorage.getItem('userData');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return isTokenValid(token);
};

// Helper function to get authentication headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  if (!isAuthenticated()) {
    return {}; // Return empty object if not authenticated
  }
  
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to clear authentication data
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

// Logout function
export const logout = (): void => {
  clearAuthData();
  // Navigate to home or login page can be handled by the component
};