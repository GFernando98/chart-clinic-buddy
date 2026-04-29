import apiClient, { extractData } from "./apiClient";
import { ApiResponse } from "@/types";
import { Product, ProductFormData } from "@/types/product";

export const productService = {
  async getAll(onlyActive = false, onlyLowStock = false): Promise<Product[]> {
    const params = new URLSearchParams();
    if (onlyActive) params.append("onlyActive", "true");
    if (onlyLowStock) params.append("onlyLowStock", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/Products/GetAll${query}`,
    );
    return extractData(response.data);
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/Products/GetById/${id}`,
    );
    return extractData(response.data);
  },

  async create(data: ProductFormData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/Products/Create",
      data,
    );
    return extractData(response.data);
  },

  async update(id: string, data: ProductFormData): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/Products/Update/${id}`,
      data,
    );
    return extractData(response.data);
  },

  async toggleStatus(id: string): Promise<Product> {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/Products/toggle-status/${id}`,
    );
    return extractData(response.data);
  },
};
