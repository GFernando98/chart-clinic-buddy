import apiClient, { extractData } from './apiClient';
import { ApiResponse, Doctor, DoctorFormData } from '@/types';

export const doctorService = {
  /**
   * Get all doctors
   */
  async getAll(): Promise<Doctor[]> {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/Doctors/GetAll');
    return extractData(response.data);
  },

  /**
   * Get doctor by ID
   */
  async getById(id: string): Promise<Doctor> {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/Doctors/GetById/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new doctor (Admin only)
   */
  async create(data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.post<ApiResponse<Doctor>>('/Doctors/Create', data);
    return extractData(response.data);
  },

  /**
   * Update an existing doctor (Admin only)
   */
  async update(id: string, data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/Doctors/Update/${id}`, data);
    return extractData(response.data);
  },

  async toggleActive(id: string): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/Doctors/ToggleActiveDoctor/${id}`);
    return extractData(response.data);
  },
};

export default doctorService;
