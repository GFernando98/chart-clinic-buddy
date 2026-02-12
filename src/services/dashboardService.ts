import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
  monthTreatments: number;
}

export interface AppointmentsByDay {
  date: string;
  count: number;
}

export interface TreatmentsByCategoryApi {
  category: string;
  color: string;
  count: number;
}

export interface TreatmentsByCategory {
  name: string;
  value: number;
  color: string;
}

export interface UpcomingAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  reason: string;
  status: number;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/Dashboard/GetStats');
    return extractData(response.data);
  },

  /**
   * Get appointments grouped by day (last 7 days)
   */
  async getAppointmentsByDay(): Promise<AppointmentsByDay[]> {
    const response = await apiClient.get<ApiResponse<AppointmentsByDay[]>>('/Dashboard/GetAppointmentsByDay');
    return extractData(response.data);
  },

  /**
   * Get treatments grouped by category (current month)
   */
  async getTreatmentsByCategory(): Promise<TreatmentsByCategory[]> {
    const response = await apiClient.get<ApiResponse<TreatmentsByCategoryApi[]>>('/Dashboard/GetTreatmentsByCategory');
    const raw = extractData(response.data);
    return raw.map((item) => ({
      name: item.category,
      value: item.count,
      color: item.color,
    }));
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(limit: number = 5): Promise<UpcomingAppointment[]> {
    const response = await apiClient.get<ApiResponse<UpcomingAppointment[]>>(`/Dashboard/GetUpcomingAppointments?limit=${limit}`);
    return extractData(response.data);
  },
};

export default dashboardService;
