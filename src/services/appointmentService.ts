import apiClient, { extractData } from './apiClient';
import { ApiResponse, Appointment, AppointmentFormData, AppointmentStatus } from '@/types';

export interface AppointmentFilters {
  from?: string;
  to?: string;
  doctorId?: string;
  status?: AppointmentStatus;
}

export const appointmentService = {
  /**
   * Get appointments with optional filters
   */
  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.status) params.append('status', filters.status.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/Appointments?${queryString}` : '/Appointments';
    
    const response = await apiClient.get<ApiResponse<Appointment[]>>(url);
    return extractData(response.data);
  },

  /**
   * Get appointment by ID
   */
  async getById(id: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/Appointments/${id}`);
    return extractData(response.data);
  },

  /**
   * Get appointments for a specific patient
   */
  async getByPatient(patientId: string): Promise<Appointment[]> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(`/Appointments/patient/${patientId}`);
    return extractData(response.data);
  },

  /**
   * Get today's appointments
   */
  async getToday(doctorId?: string): Promise<Appointment[]> {
    const url = doctorId ? `/Appointments/today?doctorId=${doctorId}` : '/Appointments/today';
    const response = await apiClient.get<ApiResponse<Appointment[]>>(url);
    return extractData(response.data);
  },

  /**
   * Create a new appointment
   */
  async create(data: AppointmentFormData): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<Appointment>>('/Appointments', data);
    return extractData(response.data);
  },

  /**
   * Update an existing appointment
   */
  async update(id: string, data: AppointmentFormData): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/Appointments/${id}`, data);
    return extractData(response.data);
  },

  /**
   * Update appointment status
   */
  async updateStatus(id: string, status: AppointmentStatus, cancellationReason?: string): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/Appointments/${id}/status`, {
      status,
      cancellationReason,
    });
    return extractData(response.data);
  },

  /**
   * Delete an appointment
   */
  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/Appointments/${id}`);
    return extractData(response.data);
  },
};

export default appointmentService;
