import apiClient, { extractData } from './apiClient';
import { ApiResponse, Patient, PatientFormData } from '@/types';

export const patientService = {
  /**
   * Get all patients
   */
  async getAll(): Promise<Patient[]> {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/Patients');
    return extractData(response.data);
  },

  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/Patients/${id}`);
    return extractData(response.data);
  },

  /**
   * Search patients by name or identity number
   */
  async search(query: string, type: 'name' | 'identityNumber' = 'name'): Promise<Patient[]> {
    const param = type === 'name' ? 'name' : 'identityNumber';
    const response = await apiClient.get<ApiResponse<Patient[]>>(`/Patients/search?${param}=${encodeURIComponent(query)}`);
    return extractData(response.data);
  },

  /**
   * Create a new patient
   */
  async create(data: PatientFormData): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>('/Patients/Create', data);
    return extractData(response.data);
  },

  /**
   * Update an existing patient
   */
  async update(id: string, data: PatientFormData): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(`/Patients/Update/${id}`, data);
    return extractData(response.data);
  },

  /**
   * Delete a patient (Admin only)
   */
  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/Patients/Delete/${id}`);
    return extractData(response.data);
  },
};

export default patientService;
