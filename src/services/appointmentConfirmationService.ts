import axios from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7820/api';

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export interface AppointmentConfirmationData {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicLogo?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'RescheduleRequested';
}

export interface ConfirmRequest {
  token: string;
}

export interface RejectRequest {
  token: string;
  reason?: string;
}

export interface RescheduleRequest {
  token: string;
  preferredDate: string;
  notes?: string;
}

const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.succeeded) {
    const msg = response.message || response.errors?.join(', ') || 'An error occurred';
    throw new Error(msg);
  }
  if (response.data === null) throw new Error('No data received');
  return response.data;
};

export const appointmentConfirmationService = {
  async validate(token: string): Promise<AppointmentConfirmationData> {
    const response = await publicClient.get<ApiResponse<AppointmentConfirmationData>>(
      `/AppointmentConfirmation/Validate?token=${encodeURIComponent(token)}`
    );
    return extractData(response.data);
  },

  async confirm(data: ConfirmRequest): Promise<void> {
    const response = await publicClient.post<ApiResponse<null>>('/AppointmentConfirmation/Confirm', data);
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Error al confirmar la cita');
    }
  },

  async reject(data: RejectRequest): Promise<void> {
    const response = await publicClient.post<ApiResponse<null>>('/AppointmentConfirmation/Reject', data);
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Error al rechazar la cita');
    }
  },

  async requestReschedule(data: RescheduleRequest): Promise<void> {
    const response = await publicClient.post<ApiResponse<null>>('/AppointmentConfirmation/RequestReschedule', data);
    if (!response.data.succeeded) {
      throw new Error(response.data.message || 'Error al solicitar reprogramación');
    }
  },
};
