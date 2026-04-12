import apiClient, { extractData } from './apiClient';
import { ApiResponse, Doctor, DoctorFormData, DoctorAvailability, SetAvailabilityData, DoctorException, AddExceptionData } from '@/types';

export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const response = await apiClient.get<ApiResponse<Doctor[]>>('/Doctors/GetAll');
    return extractData(response.data);
  },

  async getById(id: string): Promise<Doctor> {
    const response = await apiClient.get<ApiResponse<Doctor>>(`/Doctors/GetById/${id}`);
    return extractData(response.data);
  },

  async create(data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.post<ApiResponse<Doctor>>('/Doctors/Create', data);
    return extractData(response.data);
  },

  async update(id: string, data: DoctorFormData): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/Doctors/Update/${id}`, data);
    return extractData(response.data);
  },

  async toggleActive(id: string): Promise<Doctor> {
    const response = await apiClient.put<ApiResponse<Doctor>>(`/Doctors/ToggleActiveDoctor/${id}`);
    return extractData(response.data);
  },

  // Availability
  async getAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    const response = await apiClient.get<ApiResponse<DoctorAvailability[]>>(`/Doctors/GetAvailability/${doctorId}`);
    return extractData(response.data);
  },

  async setAvailability(doctorId: string, data: SetAvailabilityData): Promise<DoctorAvailability> {
    const response = await apiClient.post<ApiResponse<DoctorAvailability>>(`/Doctors/SetAvailability/${doctorId}`, data);
    return extractData(response.data);
  },

  // Exceptions
  async addException(doctorId: string, data: AddExceptionData): Promise<DoctorException> {
    const response = await apiClient.post<ApiResponse<DoctorException>>(`/Doctors/AddException/${doctorId}`, data);
    return extractData(response.data);
  },

  async removeException(exceptionId: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/Doctors/RemoveException/${exceptionId}`);
    return extractData(response.data);
  },
};

export default doctorService;
