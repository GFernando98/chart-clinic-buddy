import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  DashboardFilters,
} from "@/services/dashboardService";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (f?: DashboardFilters) => [...dashboardKeys.all, "stats", f] as const,
  appointmentsByDay: (f?: DashboardFilters) =>
    [...dashboardKeys.all, "appointmentsByDay", f] as const,
  treatmentsByCategory: (f?: DashboardFilters) =>
    [...dashboardKeys.all, "treatmentsByCategory", f] as const,
  upcomingAppointments: (from?: string, doctorId?: string, limit?: number) =>
    [
      ...dashboardKeys.all,
      "upcomingAppointments",
      from,
      doctorId,
      limit,
    ] as const,
  inventoryStats: (f?: Pick<DashboardFilters, "from" | "to">) =>
    [...dashboardKeys.all, "inventoryStats", f] as const,
};

export function useDashboardStats(filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.stats(filters),
    queryFn: () => dashboardService.getStats(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAppointmentsByDay(filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.appointmentsByDay(filters),
    queryFn: () => dashboardService.getAppointmentsByDay(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTreatmentsByCategory(filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.treatmentsByCategory(filters),
    queryFn: () => dashboardService.getTreatmentsByCategory(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpcomingAppointments(
  from?: string,
  doctorId?: string,
  limit = 10,
) {
  return useQuery({
    queryKey: dashboardKeys.upcomingAppointments(from, doctorId, limit),
    queryFn: () =>
      dashboardService.getUpcomingAppointments(from, doctorId, limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInventoryStats(
  filters?: Pick<DashboardFilters, "from" | "to">,
) {
  return useQuery({
    queryKey: dashboardKeys.inventoryStats(filters),
    queryFn: () => dashboardService.getInventoryStats(filters),
    staleTime: 1000 * 60 * 5,
  });
}
