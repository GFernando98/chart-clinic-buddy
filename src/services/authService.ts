import apiClient, { extractData, clearTokens } from './apiClient';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  LookupUserRequest,
  ClinicOption,
  UserInfo, 
  RegisterUserRequest,
  ChangePasswordRequest 
} from '@/types';

export const authService = {
  /**
   * Step 1: Lookup clinics for a userName
   */
  async lookupUser(data: LookupUserRequest): Promise<ClinicOption[]> {
    const response = await apiClient.post<ApiResponse<ClinicOption[]>>('/Auth/lookup-user', data);
    return extractData(response.data);
  },

  /**
   * Step 2: Login with userName, password, and tenantId
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
};

export default authService;
