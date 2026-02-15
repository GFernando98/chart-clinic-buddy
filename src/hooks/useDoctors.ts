import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services';
import { Doctor, DoctorFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
};

export function useDoctors() {
  return useQuery({
    queryKey: doctorKeys.lists(),
    queryFn: () => doctorService.getAll(),
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: DoctorFormData) => doctorService.create(data),
    onSuccess: (newDoctor) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      toast({
        title: 'Doctor creado',
        description: `${newDoctor.fullName} ha sido registrado exitosamente`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear doctor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DoctorFormData }) =>
      doctorService.update(id, data),
    onSuccess: (updatedDoctor) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(updatedDoctor.id) });
      toast({
        title: 'Doctor actualizado',
        description: `${updatedDoctor.fullName} ha sido actualizado`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar doctor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleDoctorActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => doctorService.toggleActive(id),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      toast({
        title: doctor.isActive ? t('users.activate') : t('users.deactivate'),
        description: `${doctor.fullName} ha sido ${doctor.isActive ? 'activado' : 'desactivado'}`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
