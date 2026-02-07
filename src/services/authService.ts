import apiClient, { extractData, clearTokens } from './apiClient';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  UserInfo, 
  RegisterUserRequest,
  ChangePasswordRequest 
} from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/Auth/login', credentials);
    return extractData(response.data);
  },

  /**
   * Logout and revoke refresh token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/Auth/logout');
    } finally {
      // Always clear tokens, even if API call fails
      clearTokens();
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo> {
    const response = await apiClient.get<ApiResponse<UserInfo>>('/Auth/me');
    return extractData(response.data);
  },

  /**
   * Register a new user (Admin only)
   */
  async register(userData: RegisterUserRequest): Promise<UserInfo> {
    const response = await apiClient.post<ApiResponse<UserInfo>>('/Auth/register', userData);
    return extractData(response.data);
  },

  /**
   * Change password for current user
   */
  async changePassword(data: ChangePasswordRequest): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>('/Auth/change-password', data);
    return extractData(response.data);
  },
};

export default authService;
