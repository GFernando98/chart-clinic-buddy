import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';
import { Product, ProductFormData } from '@/types/product';

export const productService = {
  async getAll(onlyActive = false, onlyLowStock = false): Promise<Product[]> {
    const params = new URLSearchParams();
    if (onlyActive) params.append('onlyActive', 'true');
    if (onlyLowStock) params.append('onlyLowStock', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiResponse<Product[]>>(`/Products${query}`);
    return extractData(response.data);
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/Products/${id}`);
    return extractData(response.data);
  },

  async create(data: ProductFormData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/Products', data);
    return extractData(response.data);
  },

  async update(id: string, data: ProductFormData): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/Products/${id}`, data);
    return extractData(response.data);
  },

  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/Products/${id}`);
    return extractData(response.data);
  },
};
