import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxInformationService } from '@/services/taxInformationService';
import { TaxInformationFormData } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const taxKeys = {
  all: ['taxInformation'] as const,
};

export function useTaxInformation() {
  return useQuery({
    queryKey: taxKeys.all,
    queryFn: () => taxInformationService.getAll(),
  });
}

export function useCreateTaxInformation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: TaxInformationFormData) => taxInformationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success(t('success.created'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleTaxInformation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      taxInformationService.toggle(id, activate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success(t('success.updated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
