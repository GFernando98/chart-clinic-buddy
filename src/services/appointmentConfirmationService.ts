import axios from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7820/api';

const publicClient = axios.create({
  baseURL: `${API_BASE_URL}/public/appointments`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface RescheduleRequest {
  preferredDate: string;
  notes?: string;
}

const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.succeeded) {
    const msg = response.errors?.length ? response.errors[0] : response.message || 'Ocurrió un error';
    throw new Error(msg);
  }
  if (response.data === null || response.data === undefined) throw new Error('No data received');
  return response.data;
};

const extractMessage = (response: ApiResponse<unknown>): string => {
  if (!response.succeeded) {
    const msg = response.errors?.length ? response.errors[0] : response.message || 'Ocurrió un error';
    throw new Error(msg);
  }
  return response.message || '';
};

export const appointmentConfirmationService = {
  async getSlots(doctorId: string, date: string): Promise<{ slots: TimeSlot[]; message: string | null }> {
    const response = await publicClient.get<ApiResponse<TimeSlot[]>>('/slots', {
      params: { doctorId, date },
    });
    const data = response.data;
    if (!data.succeeded) {
      const msg = data.errors?.length ? data.errors[0] : data.message || 'Error al obtener horarios';
      throw new Error(msg);
    }
    return { slots: data.data || [], message: data.message || null };
  },

  async confirm(token: string): Promise<string> {
    const response = await publicClient.post<ApiResponse<boolean>>(`/confirm/${encodeURIComponent(token)}`);
    return extractMessage(response.data);
  },

  async reschedule(token: string, data: RescheduleRequest): Promise<string> {
    const response = await publicClient.post<ApiResponse<boolean>>(
      `/reschedule/${encodeURIComponent(token)}`,
      data
    );
    return extractMessage(response.data);
  },
};
