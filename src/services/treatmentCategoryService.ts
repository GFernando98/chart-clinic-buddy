import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';

export interface TreatmentCategoryDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface TreatmentCategoryFormData {
  name: string;
  description?: string;
}

export const treatmentCategoryService = {
  /**
   * Get all treatment categories
   */
  async getAll(): Promise<TreatmentCategoryDto[]> {
    const response = await apiClient.get<ApiResponse<TreatmentCategoryDto[]>>('/TreatmentCategories/GetAll');
    return extractData(response.data);
  },

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<TreatmentCategoryDto> {
    const response = await apiClient.get<ApiResponse<TreatmentCategoryDto>>(`/TreatmentCategories/GetById/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new category (Admin only)
   */
  async create(data: TreatmentCategoryFormData): Promise<TreatmentCategoryDto> {
    const response = await apiClient.post<ApiResponse<TreatmentCategoryDto>>('/TreatmentCategories/Create', data);
    return extractData(response.data);
  },

  /**
   * Update an existing category (Admin only)
   */
  async update(id: string, data: TreatmentCategoryFormData): Promise<TreatmentCategoryDto> {
    const response = await apiClient.put<ApiResponse<TreatmentCategoryDto>>(`/TreatmentCategories/Update/${id}`, data);
    return extractData(response.data);
  },

  /**
   * Toggle category active status (Admin only)
   */
  async toggleActive(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/TreatmentCategories/ToggleActive/${id}`);
    return extractData(response.data);
  },
};

export default treatmentCategoryService;
