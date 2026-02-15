import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentCategoryService, TreatmentCategoryFormData } from '@/services/treatmentCategoryService';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const treatmentCategoryKeys = {
  all: ['treatmentCategories'] as const,
  lists: () => [...treatmentCategoryKeys.all, 'list'] as const,
  detail: (id: string) => [...treatmentCategoryKeys.all, 'detail', id] as const,
};

export function useTreatmentCategories() {
  return useQuery({
    queryKey: treatmentCategoryKeys.lists(),
    queryFn: () => treatmentCategoryService.getAll(),
  });
}

export function useCreateTreatmentCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: TreatmentCategoryFormData) => treatmentCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentCategoryKeys.lists() });
      toast({
        title: t('common.success'),
        description: t('settings.categoryCreated'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTreatmentCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TreatmentCategoryFormData }) =>
      treatmentCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentCategoryKeys.lists() });
      toast({
        title: t('common.success'),
        description: t('settings.categoryUpdated'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleTreatmentCategoryActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => treatmentCategoryService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentCategoryKeys.lists() });
      toast({
        title: t('success.updated'),
        description: t('settings.categoryStatusUpdated'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('errors.generic'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
