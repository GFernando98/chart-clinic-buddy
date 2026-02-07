import apiClient, { extractData } from './apiClient';
import { ApiResponse, User, UserRole } from '@/types';

export const userService = {
  /**
   * Get all users (Admin only)
   */
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/Users');
    return extractData(response.data);
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/Users/${id}`);
    return extractData(response.data);
  },

  /**
   * Toggle user active status (Admin only)
   */
  async toggleActive(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/Users/${id}/toggle-active`);
    return extractData(response.data);
  },

  /**
   * Update user roles (Admin only)
   */
  async updateRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/Users/${id}/roles`, roles);
    return extractData(response.data);
  },
};

export default userService;
