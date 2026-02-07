import apiClient, { extractData } from './apiClient';
import { ApiResponse, Patient, PatientFormData } from '@/types';

export const patientService = {
  /**
   * Get all patients
   */
  async getAll(): Promise<Patient[]> {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients');
    return extractData(response.data);
  },

  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return extractData(response.data);
  },

  /**
   * Search patients by name or identity number
   */
  async search(query: string, type: 'name' | 'identityNumber' = 'name'): Promise<Patient[]> {
    const param = type === 'name' ? 'name' : 'identityNumber';
    const response = await apiClient.get<ApiResponse<Patient[]>>(`/patients/search?${param}=${encodeURIComponent(query)}`);
    return extractData(response.data);
  },

  /**
   * Create a new patient
   */
  async create(data: PatientFormData): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return extractData(response.data);
  },

  /**
   * Update an existing patient
   */
  async update(id: string, data: PatientFormData): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return extractData(response.data);
  },

  /**
   * Delete a patient (Admin only)
   */
  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/patients/${id}`);
    return extractData(response.data);
  },
};

export default patientService;
