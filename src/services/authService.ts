import apiClient, { extractData, clearTokens } from './apiClient';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  UserInfo, 
  RegisterUserRequest,
  ChangePasswordRequest 
} from '@/types';

export interface PublicTenant {
  id: string;
  name: string;
}

export const authService = {
  /**
   * Get public list of tenants for clinic selection
   */
  async getPublicTenants(): Promise<PublicTenant[]> {
    const response = await apiClient.get<{ data: PublicTenant[] }>('/Master/tenants/public');
    return response.data.data;
  },

  /**
   * Login with userName, password, and tenantId
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/Auth/login', credentials);
    return response.data;
  },

  /**
   * Logout and revoke refresh token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/Auth/logout');
    } finally {
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

  /**
   * Request password reset email
   */
  async forgotPassword(email: string, tenantId: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>('/Auth/forgot-password', { email, tenantId });
    return response.data.succeeded;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, tenantId: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>('/Auth/reset-password', { token, newPassword, tenantId });
    return response.data.succeeded;
  },
};

export default authService;
