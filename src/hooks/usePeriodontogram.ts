import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodontogramService } from '@/services/periodontogramService';
import {
  CreatePeriodontogramData,
  SaveToothMeasurementsData,
  FinalizePeriodontogramData,
} from '@/types/periodontogram';
import { useToast } from '@/hooks/use-toast';

export const periodontogramKeys = {
  all: ['periodontograms'] as const,
  byPatient: (patientId: string) => [...periodontogramKeys.all, 'patient', patientId] as const,
  detail: (id: string) => [...periodontogramKeys.all, 'detail', id] as const,
};

export function usePatientPeriodontograms(patientId: string) {
  return useQuery({
    queryKey: periodontogramKeys.byPatient(patientId),
    queryFn: () => periodontogramService.getByPatient(patientId),
    enabled: !!patientId,
  });
}

export function usePeriodontogram(id: string) {
  return useQuery({
    queryKey: periodontogramKeys.detail(id),
    queryFn: () => periodontogramService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePeriodontogram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePeriodontogramData) => periodontogramService.create(data),
    onSuccess: (newPerio) => {
      queryClient.invalidateQueries({ queryKey: periodontogramKeys.byPatient(newPerio.patientId) });
      toast({ title: 'Periodontograma creado', variant: 'success' as any });
    },
    onError: (error: any) => {
      const details = error.errorDetails?.length ? error.errorDetails.join(' • ') : error.message;
      toast({ title: error.apiMessage || 'Error al crear periodontograma', description: details, variant: 'destructive' });
    },
  });
}

export function useSaveToothMeasurements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SaveToothMeasurementsData) => periodontogramService.saveToothMeasurements(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: periodontogramKeys.detail(variables.periodontogramId) });
      toast({ title: `Diente ${variables.toothNumber} guardado`, variant: 'success' as any });
    },
    onError: (error: any) => {
      const details = error.errorDetails?.length ? error.errorDetails.join(' • ') : error.message;
      toast({ title: error.apiMessage || 'Error al guardar mediciones', description: details, variant: 'destructive' });
    },
  });
}

export function useFinalizePeriodontogram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinalizePeriodontogramData }) =>
      periodontogramService.finalize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: periodontogramKeys.all });
      toast({ title: 'Periodontograma finalizado', variant: 'success' as any });
    },
    onError: (error: any) => {
      const details = error.errorDetails?.length ? error.errorDetails.join(' • ') : error.message;
      toast({ title: error.apiMessage || 'Error al finalizar', description: details, variant: 'destructive' });
    },
  });
}
