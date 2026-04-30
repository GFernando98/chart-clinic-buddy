import apiClient, { extractData } from "./apiClient";
import { ApiResponse } from "@/types";

// ─── Filtros compartidos ──────────────────────────────────────
export interface DashboardFilters {
  from?: string; // "2026-01-01"
  to?: string; // "2026-05-31"
  doctorId?: string;
}

// ─── Stats ───────────────────────────────────────────────────
export interface DashboardStats {
  // Siempre actuales
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
  activeDoctors: number;

  // Del período
  periodFrom: string;
  periodTo: string;
  appointmentsInPeriod: number;
  completedInPeriod: number;
  cancelledInPeriod: number;
  noShowInPeriod: number;
  newPatientsInPeriod: number;
  monthTreatments: number;
  cancellationRate: number;
  completionRate: number;
}

// ─── Appointments by Day ──────────────────────────────────────
export interface AppointmentsByDay {
  day: string; // "2026-04-28"
  dayLabel: string; // "Lun"
  count: number;
  completed: number;
  cancelled: number;
  pending: number;
}

// ─── Treatments by Category ───────────────────────────────────
export interface TreatmentsByCategoryApi {
  category: string;
  color: string;
  count: number;
  revenue: number;
}

// Formato normalizado para Recharts PieChart
export interface TreatmentsByCategory {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

// ─── Upcoming Appointments ────────────────────────────────────
export interface UpcomingAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledDate: string;
  scheduledEndDate: string | null;
  reason: string | null;
  status: number;
}

// ─── Inventory Stats ──────────────────────────────────────────
export interface InventoryDashboardStats {
  activeProducts: number;
  inventoryValue: number;
  lowStockProducts: number;
  expiringSoonProducts: number;
  monthMovements: number;
  totalEntries: number;
  totalExits: number;
  periodFrom: string;
  periodTo: string;
  movementsByDay: { date: string; entries: number; exits: number }[];
  topSellingProducts: {
    productName: string;
    productCode: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────────
function buildQuery(filters?: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);
  if (filters?.doctorId) params.append("doctorId", filters.doctorId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Service ─────────────────────────────────────────────────
export const dashboardService = {
  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      `/Dashboard/GetStats${buildQuery(filters)}`,
    );
    return extractData(response.data);
  },

  async getAppointmentsByDay(
    filters?: DashboardFilters,
  ): Promise<AppointmentsByDay[]> {
    const response = await apiClient.get<ApiResponse<AppointmentsByDay[]>>(
      `/Dashboard/GetAppointmentsByDay${buildQuery(filters)}`,
    );
    return extractData(response.data);
  },

  async getTreatmentsByCategory(
    filters?: DashboardFilters,
  ): Promise<TreatmentsByCategory[]> {
    const response = await apiClient.get<
      ApiResponse<TreatmentsByCategoryApi[]>
    >(`/Dashboard/GetTreatmentsByCategory${buildQuery(filters)}`);
    const raw = extractData(response.data);
    // Normalizar al formato que espera Recharts
    return raw.map((item) => ({
      name: item.category,
      value: item.count,
      revenue: item.revenue,
      color: item.color,
    }));
  },

  async getUpcomingAppointments(
    from?: string,
    doctorId?: string,
    limit = 10,
  ): Promise<UpcomingAppointment[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (from) params.append("from", from);
    if (doctorId) params.append("doctorId", doctorId);
    const response = await apiClient.get<ApiResponse<UpcomingAppointment[]>>(
      `/Dashboard/GetUpcomingAppointments?${params.toString()}`,
    );
    return extractData(response.data);
  },

  async getInventoryStats(
    filters?: Pick<DashboardFilters, "from" | "to">,
  ): Promise<InventoryDashboardStats> {
    const response = await apiClient.get<ApiResponse<InventoryDashboardStats>>(
      `/Dashboard/GetInventoryStats${buildQuery(filters)}`,
    );
    return extractData(response.data);
  },
};

export default dashboardService;
