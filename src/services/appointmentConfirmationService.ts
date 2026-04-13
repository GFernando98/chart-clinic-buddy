import axios from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7820/api';

const publicClient = axios.create({
  baseURL: `${API_BASE_URL}/public/appointments`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export interface AppointmentDetails {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  scheduledEndDate: string;
  status: string;
  reason: string;
}

export interface PublicDoctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  isActive: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface RescheduleRequest {
  preferredDate: string;
  notes?: string;
}

const handleError = (data: ApiResponse<unknown>): never => {
  const msg = data.errors?.length ? data.errors[0] : data.message || 'Ocurrió un error';
  throw new Error(msg);
};

export const appointmentConfirmationService = {
  async getAppointmentByToken(token: string): Promise<AppointmentDetails> {
    const response = await publicClient.get<ApiResponse<AppointmentDetails>>(
      `/appointment/${encodeURIComponent(token)}`
    );
    if (!response.data.succeeded || !response.data.data) handleError(response.data);
    return response.data.data!;
  },

  async getDoctors(): Promise<PublicDoctor[]> {
    const response = await publicClient.get<ApiResponse<PublicDoctor[]>>('/doctors');
    if (!response.data.succeeded) handleError(response.data);
    return response.data.data || [];
  },

  async getSlots(doctorId: string, date: string): Promise<{ slots: TimeSlot[]; message: string | null }> {
    const response = await publicClient.get<ApiResponse<TimeSlot[]>>('/slots', {
      params: { doctorId, date },
    });
    if (!response.data.succeeded) handleError(response.data);
    return { slots: response.data.data || [], message: response.data.message || null };
  },

  async confirm(token: string): Promise<string> {
    const response = await publicClient.post<ApiResponse<boolean>>(
      `/confirm/${encodeURIComponent(token)}`
    );
    if (!response.data.succeeded) handleError(response.data);
    return response.data.message || '';
  },

  async reschedule(token: string, data: RescheduleRequest): Promise<string> {
    const response = await publicClient.post<ApiResponse<boolean>>(
      `/reschedule/${encodeURIComponent(token)}`,
      data
    );
    if (!response.data.succeeded) handleError(response.data);
    return response.data.message || '';
  },
};
