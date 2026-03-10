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

export interface InventoryDashboardStats {
  activeProducts: number;
  inventoryValue: number;
  lowStockProducts: number;
  monthMovements: number;
  movementsByDay: { date: string; entries: number; exits: number }[];
  topSellingProducts: { productName: string; productCode: string; quantitySold: number; totalRevenue: number }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/Dashboard/GetStats');
    return extractData(response.data);
  },

  async getAppointmentsByDay(): Promise<AppointmentsByDay[]> {
    const response = await apiClient.get<ApiResponse<AppointmentsByDay[]>>('/Dashboard/GetAppointmentsByDay');
    return extractData(response.data);
  },

  async getTreatmentsByCategory(): Promise<TreatmentsByCategory[]> {
    const response = await apiClient.get<ApiResponse<TreatmentsByCategoryApi[]>>('/Dashboard/GetTreatmentsByCategory');
    const raw = extractData(response.data);
    return raw.map((item) => ({
      name: item.category,
      value: item.count,
      color: item.color,
    }));
  },

  async getUpcomingAppointments(limit: number = 5): Promise<UpcomingAppointment[]> {
    const response = await apiClient.get<ApiResponse<UpcomingAppointment[]>>(`/Dashboard/GetUpcomingAppointments?limit=${limit}`);
    return extractData(response.data);
  },

  async getInventoryStats(): Promise<InventoryDashboardStats> {
    const response = await apiClient.get<ApiResponse<InventoryDashboardStats>>('/Dashboard/GetInventoryStats');
    return extractData(response.data);
  },
};

export default dashboardService;
