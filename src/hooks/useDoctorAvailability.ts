import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services';
import { SetAvailabilityData, AddExceptionData } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const availabilityKeys = {
  all: ['doctor-availability'] as const,
  detail: (doctorId: string) => [...availabilityKeys.all, doctorId] as const,
  exceptions: (doctorId: string) => [...availabilityKeys.all, 'exceptions', doctorId] as const,
};

export function useDoctorAvailability(doctorId: string) {
  return useQuery({
    queryKey: availabilityKeys.detail(doctorId),
    queryFn: () => doctorService.getAvailability(doctorId),
    enabled: !!doctorId,
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: SetAvailabilityData }) =>
      doctorService.setAvailability(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.detail(variables.doctorId) });
      toast({ title: 'Disponibilidad actualizada', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddException() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: AddExceptionData }) =>
      doctorService.addException(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.detail(variables.doctorId) });
      toast({ title: 'Excepción agregada', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveException(doctorId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (exceptionId: string) => doctorService.removeException(exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.detail(doctorId) });
      toast({ title: 'Excepción eliminada', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
