import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentService } from '@/services';
import { Treatment, TreatmentFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const treatmentKeys = {
  all: ['treatments'] as const,
  lists: () => [...treatmentKeys.all, 'list'] as const,
  details: () => [...treatmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...treatmentKeys.details(), id] as const,
};

export function useTreatments() {
  return useQuery({
    queryKey: treatmentKeys.lists(),
    queryFn: () => treatmentService.getAll(),
  });
}

export function useTreatment(id: string) {
  return useQuery({
    queryKey: treatmentKeys.detail(id),
    queryFn: () => treatmentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TreatmentFormData) => treatmentService.create(data),
    onSuccess: (newTreatment) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
      toast({
        title: 'Tratamiento creado',
        description: `${newTreatment.name} ha sido creado exitosamente`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear tratamiento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TreatmentFormData }) =>
      treatmentService.update(id, data),
    onSuccess: (updatedTreatment) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: treatmentKeys.detail(updatedTreatment.id) });
      toast({
        title: 'Tratamiento actualizado',
        description: `${updatedTreatment.name} ha sido actualizado`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar tratamiento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleTreatmentActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => treatmentService.toggleActive(id),
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() });
      toast({
        title: treatment.isActive ? t('users.activate') : t('users.deactivate'),
        description: `${treatment.name} ha sido ${treatment.isActive ? 'activado' : 'desactivado'}`,
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
