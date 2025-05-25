// Configuration utilities for the application
export interface AppConfig {
  apiBaseUrl: string;
  appPort: number;
  appHost: string;
  buildSourcemap: boolean;
  buildOutDir: string;
  debugApi: boolean;
  debugAuth: boolean;
}

/**
 * Get application configuration from environment variables
 * with fallback defaults
 */
export const getAppConfig = (): AppConfig => {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002',
    appPort: parseInt(import.meta.env.VITE_APP_PORT || '3000', 10),
    appHost: import.meta.env.VITE_APP_HOST || 'localhost',
    buildSourcemap: import.meta.env.VITE_BUILD_SOURCEMAP === 'true',
    buildOutDir: import.meta.env.VITE_BUILD_OUTDIR || 'dist',
    debugApi: import.meta.env.VITE_DEBUG_API === 'true',
    debugAuth: import.meta.env.VITE_DEBUG_AUTH === 'true'
  };
};

/**
 * Global app configuration instance
 */
export const appConfig = getAppConfig();

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  RECIPES: {
    BASE: '/api/recipes',
    SEARCH: '/api/recipes/search',
    CREATE: '/api/recipes',
    UPDATE: (id: string) => `/api/recipes/${id}`,
    DELETE: (id: string) => `/api/recipes/${id}`,
    GET_BY_ID: (id: string) => `/api/recipes/${id}`
  },
  AI: {
    PREDICT: '/api/predict',
    ANALYZE: '/api/ai/analyze',
    SUGGESTIONS: '/api/ai/suggestions'
  },
  OPENROUTER: {
    CHAT: '/api/openrouter/chat',
    MODELS: '/api/openrouter/models'
  }
} as const;

/**
 * Application constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'RecipeFindr',
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  TOKEN_STORAGE_KEY: 'recipefindr_token',
  USER_STORAGE_KEY: 'recipefindr_user'
} as const;
