import apiClient, { extractData } from './apiClient';
import { ApiResponse, TaxInformation, TaxInformationFormData } from '@/types';

export const taxInformationService = {
  async getAll(): Promise<TaxInformation[]> {
    const response = await apiClient.get<ApiResponse<TaxInformation[]>>('/TaxInformation/GetAll');
    return extractData(response.data);
  },

  async create(data: TaxInformationFormData): Promise<TaxInformation> {
    const response = await apiClient.post<ApiResponse<TaxInformation>>('/TaxInformation/Create', data);
    return extractData(response.data);
  },

  async deactivate(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/TaxInformation/Deactivate/${id}`);
    return extractData(response.data);
  },
};

export default taxInformationService;
