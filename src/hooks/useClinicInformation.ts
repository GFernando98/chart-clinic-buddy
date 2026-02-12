import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicInformationService } from '@/services/clinicInformationService';
import { ClinicInformationFormData } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const clinicKeys = {
  all: ['clinicInformation'] as const,
};

export function useClinicInformation() {
  return useQuery({
    queryKey: clinicKeys.all,
    queryFn: () => clinicInformationService.get(),
    retry: false,
  });
}

export function useUpdateClinicInformation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ClinicInformationFormData) => clinicInformationService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicKeys.all });
      toast.success(t('success.updated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
