import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  appointmentsByDay: () => [...dashboardKeys.all, 'appointmentsByDay'] as const,
  treatmentsByCategory: () => [...dashboardKeys.all, 'treatmentsByCategory'] as const,
  upcomingAppointments: () => [...dashboardKeys.all, 'upcomingAppointments'] as const,
  inventoryStats: () => [...dashboardKeys.all, 'inventoryStats'] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAppointmentsByDay() {
  return useQuery({
    queryKey: dashboardKeys.appointmentsByDay(),
    queryFn: () => dashboardService.getAppointmentsByDay(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTreatmentsByCategory() {
  return useQuery({
    queryKey: dashboardKeys.treatmentsByCategory(),
    queryFn: () => dashboardService.getTreatmentsByCategory(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpcomingAppointments(limit: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.upcomingAppointments(),
    queryFn: () => dashboardService.getUpcomingAppointments(limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: dashboardKeys.inventoryStats(),
    queryFn: () => dashboardService.getInventoryStats(),
    staleTime: 1000 * 60 * 5,
  });
}
