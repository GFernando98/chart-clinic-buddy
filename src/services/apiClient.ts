import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/types';

// API Base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7820/api';

// Cookie names
const ACCESS_TOKEN_COOKIE = 'dental_access_token';
const REFRESH_TOKEN_COOKIE = 'dental_refresh_token';

// Cookie options
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: window.location.protocol === 'https:',
  sameSite: 'strict',
  path: '/',
};

// Token storage in cookies
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Callbacks for auth state management
let onTokenRefreshed: ((newAccessToken: string, newRefreshToken: string) => void) | null = null;
let onAuthError: (() => void) | null = null;
let onActivityTracked: (() => void) | null = null;

// Get tokens from cookies
const getAccessToken = (): string | null => Cookies.get(ACCESS_TOKEN_COOKIE) || null;
const getRefreshToken = (): string | null => Cookies.get(REFRESH_TOKEN_COOKIE) || null;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    // Track activity on successful responses
    onActivityTracked?.();
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: Error) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        // Attempt token refresh
        if (!accessToken || !refreshToken) {
          throw new Error('No tokens available');
        }

        const response = await axios.post<ApiResponse<{
          accessToken: string;
          refreshToken: string;
          accessTokenExpiration: string;
        }>>(`${API_BASE_URL}/Auth/refresh-token`, {
          accessToken,
          refreshToken,
        });

        if (response.data.succeeded && response.data.data) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken;

          // Update tokens in cookies
          setTokens(newAccessToken, newRefreshToken);
          onTokenRefreshed?.(newAccessToken, newRefreshToken);

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Clear tokens and trigger auth error callback
        clearTokens();
        onAuthError?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors - extract meaningful message from API response
    if (error.response?.data) {
      const apiError = error.response.data as any;
      let errorMessage = 'An error occurred';
      let fieldErrors: Record<string, string[]> | undefined;
      
      // Handle ASP.NET validation error format: { errors: { FieldName: ["msg"] } }
      if (apiError.errors && typeof apiError.errors === 'object' && !Array.isArray(apiError.errors)) {
        fieldErrors = apiError.errors;
        const allMessages = Object.values(apiError.errors).flat() as string[];
        errorMessage = allMessages.join(', ');
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (Array.isArray(apiError.errors) && apiError.errors.length) {
        errorMessage = apiError.errors.join(', ');
      } else if (apiError.title) {
        errorMessage = apiError.title;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      (enhancedError as any).statusCode = error.response.status;
      (enhancedError as any).fieldErrors = fieldErrors;
      return Promise.reject(enhancedError);
    }

    return Promise.reject(error);
  }
);

// Token management functions - using cookies
export const setTokens = (newAccessToken: string, newRefreshToken: string) => {
  // Set access token (expires in 15 min typically, but we let the server handle expiration)
  Cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
    ...COOKIE_OPTIONS,
    expires: 1, // 1 day
  });
  
  // Set refresh token (longer lived)
  Cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
    ...COOKIE_OPTIONS,
    expires: 7, // 7 days
  });
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
};

export const getTokens = () => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
});

export const hasValidTokens = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken();
};

// Auth callback setters
export const setOnTokenRefreshed = (callback: (accessToken: string, refreshToken: string) => void) => {
  onTokenRefreshed = callback;
};

export const setOnAuthError = (callback: () => void) => {
  onAuthError = callback;
};

export const setOnActivityTracked = (callback: () => void) => {
  onActivityTracked = callback;
};

// Helper to extract data from API response
export const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.succeeded) {
    const errorMessage = response.message || response.errors?.join(', ') || 'An error occurred';
    throw new Error(errorMessage);
  }
  if (response.data === null) {
    throw new Error('No data received');
  }
  return response.data;
};

// Error message extractor
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      if (apiError.message) return apiError.message;
      if (apiError.errors?.length) return apiError.errors.join(', ');
    }
    if (axiosError.message) return axiosError.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;
