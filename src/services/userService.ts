import apiClient, { extractData } from './apiClient';
import { ApiResponse, User, UserRole } from '@/types';

export interface CreateUserData {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: UserRole[];
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/Users/GetAll');
    return extractData(response.data);
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/Users/Create', data);
    return extractData(response.data);
  },

  async toggleActive(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/Users/ToggleActive/${id}`);
    return extractData(response.data);
  },

  async updateRoles(id: string, roles: UserRole[]): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/Users/UpdateRoles/${id}`, roles);
    return extractData(response.data);
  },
};

export default userService;
