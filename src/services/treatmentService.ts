import apiClient, { extractData } from './apiClient';
import { ApiResponse, Treatment, TreatmentFormData } from '@/types';

export const treatmentService = {
  /**
   * Get all treatments
   */
  async getAll(): Promise<Treatment[]> {
    const response = await apiClient.get<ApiResponse<Treatment[]>>('/Treatments/GetAll');
    return extractData(response.data);
  },

  /**
   * Get treatment by ID
   */
  async getById(id: string): Promise<Treatment> {
    const response = await apiClient.get<ApiResponse<Treatment>>(`/Treatments/GetById/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new treatment (Admin only)
   */
  async create(data: TreatmentFormData): Promise<Treatment> {
    const response = await apiClient.post<ApiResponse<Treatment>>('/Treatments/Create', data);
    return extractData(response.data);
  },

  /**
   * Update an existing treatment (Admin only)
   */
  async update(id: string, data: TreatmentFormData): Promise<Treatment> {
    const response = await apiClient.put<ApiResponse<Treatment>>(`/Treatments/Update/${id}`, data);
    return extractData(response.data);
  },
};

export default treatmentService;
