// Use VITE_API_BASE_URL or fallback to '/api'
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const loginUser = async (credentials) => {
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
  return data; // Expected: { token, user }
};

export const registerUser = async (userData) => {
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
  return data; // Expected: { message, (token, user if auto-login) }
};
