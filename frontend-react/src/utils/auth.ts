// utils/auth.ts

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};