import apiClient, { extractData } from './apiClient';
import { ApiResponse, User, UserRole } from '@/types';

export const userService = {
  /**
   * Get all users (Admin only)
   */
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/Users/GetAll');
    return extractData(response.data);
  },

  /**
   * Toggle user active status (Admin only)
   */
  async toggleActive(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/Users/ToggleActive/${id}`);
    return extractData(response.data);
  },

  /**
   * Update user roles (Admin only)
   */
  async updateRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/Users/UpdateRoles/${id}`, roles);
    return extractData(response.data);
  },
};

export default userService;
