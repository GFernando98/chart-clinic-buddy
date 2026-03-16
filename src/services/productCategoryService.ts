import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';
import { ProductCategory, CreateProductCategoryData, UpdateProductCategoryData } from '@/types/productCategory';

export const productCategoryService = {
  async getAll(onlyActive = false): Promise<ProductCategory[]> {
    const query = onlyActive ? '?onlyActive=true' : '';
    const response = await apiClient.get<ApiResponse<ProductCategory[]>>(`/ProductCategories${query}`);
    return extractData(response.data);
  },

  async getById(id: string): Promise<ProductCategory> {
    const response = await apiClient.get<ApiResponse<ProductCategory>>(`/ProductCategories/${id}`);
    return extractData(response.data);
  },

  async create(data: CreateProductCategoryData): Promise<ProductCategory> {
    const response = await apiClient.post<ApiResponse<ProductCategory>>('/ProductCategories', data);
    return extractData(response.data);
  },

  async update(id: string, data: UpdateProductCategoryData): Promise<ProductCategory> {
    const response = await apiClient.put<ApiResponse<ProductCategory>>(`/ProductCategories/${id}`, data);
    return extractData(response.data);
  },

  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/ProductCategories/${id}`);
    return extractData(response.data);
  },
};
