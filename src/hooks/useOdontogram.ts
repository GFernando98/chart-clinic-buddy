import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramService, CreateOdontogramData, UpdateToothData, AddSurfaceData, AddToothTreatmentData } from '@/services';
import { useToast } from '@/hooks/use-toast';

export const odontogramKeys = {
  all: ['odontograms'] as const,
  byPatient: (patientId: string) => [...odontogramKeys.all, 'patient', patientId] as const,
  detail: (id: string) => [...odontogramKeys.all, 'detail', id] as const,
  toothTreatments: (toothRecordId: string) => [...odontogramKeys.all, 'treatments', toothRecordId] as const,
};

export function usePatientOdontogram(patientId: string) {
  return useQuery({
    queryKey: odontogramKeys.byPatient(patientId),
    queryFn: () => odontogramService.getByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useOdontogram(id: string) {
  return useQuery({
    queryKey: odontogramKeys.detail(id),
    queryFn: () => odontogramService.getById(id),
    enabled: !!id,
  });
}

export function useToothTreatments(toothRecordId: string) {
  return useQuery({
    queryKey: odontogramKeys.toothTreatments(toothRecordId),
    queryFn: () => odontogramService.getToothTreatments(toothRecordId),
    enabled: !!toothRecordId && !toothRecordId.startsWith('tooth-'),
  });
}

export function useCreateOdontogram() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOdontogramData) => odontogramService.create(data),
    onSuccess: (newOdontogram) => {
      queryClient.invalidateQueries({ queryKey: odontogramKeys.byPatient(newOdontogram.patientId) });
      toast({
        title: 'Odontograma creado',
        description: 'El odontograma ha sido creado exitosamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear odontograma',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTooth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ toothRecordId, data }: { toothRecordId: string; data: UpdateToothData }) =>
      odontogramService.updateTooth(toothRecordId, data),
    onSuccess: (updatedTooth) => {
      queryClient.invalidateQueries({ queryKey: odontogramKeys.all });
      toast({
        title: 'Diente actualizado',
        description: `Diente #${updatedTooth.toothNumber} actualizado`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar diente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAddSurface() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ toothRecordId, data }: { toothRecordId: string; data: AddSurfaceData }) =>
      odontogramService.addSurface(toothRecordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: odontogramKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error adding surface:', error);
    },
  });
}

export function useAddToothTreatment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ toothRecordId, data }: { toothRecordId: string; data: AddToothTreatmentData }) =>
      odontogramService.addTreatment(toothRecordId, data),
    onSuccess: (newTreatment, variables) => {
      queryClient.invalidateQueries({ queryKey: odontogramKeys.toothTreatments(variables.toothRecordId) });
      queryClient.invalidateQueries({ queryKey: odontogramKeys.all });
      toast({
        title: 'Tratamiento registrado',
        description: 'El tratamiento ha sido registrado exitosamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al registrar tratamiento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
