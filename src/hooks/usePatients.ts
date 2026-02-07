import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services';
import { Patient, PatientFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: string) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

export function usePatients() {
  return useQuery({
    queryKey: patientKeys.lists(),
    queryFn: () => patientService.getAll(),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  });
}

export function useSearchPatients(query: string, type: 'name' | 'identityNumber' = 'name') {
  return useQuery({
    queryKey: patientKeys.list(`search-${type}-${query}`),
    queryFn: () => patientService.search(query, type),
    enabled: query.length >= 2,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PatientFormData) => patientService.create(data),
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      toast({
        title: 'Paciente creado',
        description: `${newPatient.fullName} ha sido registrado exitosamente`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear paciente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormData }) =>
      patientService.update(id, data),
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(updatedPatient.id) });
      toast({
        title: 'Paciente actualizado',
        description: `${updatedPatient.fullName} ha sido actualizado`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar paciente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
      toast({
        title: 'Paciente eliminado',
        description: 'El paciente ha sido eliminado exitosamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar paciente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
