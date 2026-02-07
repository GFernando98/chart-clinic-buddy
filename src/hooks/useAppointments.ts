import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, AppointmentFilters } from '@/services';
import { Appointment, AppointmentFormData, AppointmentStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  patient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
  today: (doctorId?: string) => [...appointmentKeys.all, 'today', doctorId] as const,
};

export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentService.getAll(filters),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: appointmentKeys.patient(patientId),
    queryFn: () => appointmentService.getByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useTodayAppointments(doctorId?: string) {
  return useQuery({
    queryKey: appointmentKeys.today(doctorId),
    queryFn: () => appointmentService.getToday(doctorId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AppointmentFormData) => appointmentService.create(data),
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast({
        title: 'Cita creada',
        description: `Cita para ${newAppointment.patientName} ha sido programada`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear cita',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AppointmentFormData }) =>
      appointmentService.update(id, data),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(updatedAppointment.id) });
      toast({
        title: 'Cita actualizada',
        description: `La cita ha sido actualizada`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar cita',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, cancellationReason }: { id: string; status: AppointmentStatus; cancellationReason?: string }) =>
      appointmentService.updateStatus(id, status, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la cita ha sido actualizado',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar estado',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => appointmentService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) });
      toast({
        title: 'Cita eliminada',
        description: 'La cita ha sido eliminada exitosamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar cita',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
