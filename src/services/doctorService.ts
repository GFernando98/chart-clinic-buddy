import apiClient, { extractData } from './apiClient';
import { ApiResponse, Doctor, DoctorFormData } from '@/types';

export const doctorService = {
  /**
   * Get all doctors
   */
  async getAll(): Promise<Doctor[]> {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/doctors');
    return extractData(response.data);
  },

  /**
   * Get doctor by ID
   */
  async getById(id: string): Promise<Doctor> {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new doctor (Admin only)
   */
  async create(data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    return extractData(response.data);
  },

  /**
   * Update an existing doctor (Admin only)
   */
  async update(id: string, data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return extractData(response.data);
  },

  /**
   * Toggle doctor active status
   */
  async toggleActive(id: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(`/doctors/${id}/toggle-active`);
    return extractData(response.data);
  },
};

export default doctorService;
