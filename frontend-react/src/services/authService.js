// Use VITE_API_BASE_URL or fallback to '/api' for relative path
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Token handling utilities
const getAuthToken = () => localStorage.getItem('authToken');
const setAuthToken = (token) => localStorage.setItem('authToken', token);
const removeAuthToken = () => localStorage.removeItem('authToken');

// User data handling utilities
const getUserData = () => {
  const userStr = localStorage.getItem('userData');
  return userStr ? JSON.parse(userStr) : null;
};
const setUserData = (user) => localStorage.setItem('userData', JSON.stringify(user));
const removeUserData = () => localStorage.removeItem('userData');

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  // Basic JWT expiration check
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000;
  } catch (e) {
    return false;
  }
};

// Login user
const loginUser = async (credentials) => {
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
  
  // Save auth data
  setAuthToken(data.token);
  setUserData(data.user);
  
  return data;
};

// Register user - Fixed to handle both object and separate params
const registerUser = async (usernameOrData, password) => {
  // Determine if called with (username, password) or ({username, password})
  let userData;
  
  if (typeof usernameOrData === 'string') {
    // Called with separate parameters: register(username, password)
    userData = { username: usernameOrData, password };
  } else {
    // Called with object: register({username, password})
    userData = usernameOrData;
  }
  
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
  
  // If auto-login on register, save auth data
  if (data.token && data.user) {
    setAuthToken(data.token);
    setUserData(data.user);
  }
  
  return data;
};

// Logout user
const logout = () => {
  removeAuthToken();
  removeUserData();
};

// Get user helper
const getUser = () => {
  return getUserData();
};

// Get auth headers helper
const getAuthHeaders = () => {
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
