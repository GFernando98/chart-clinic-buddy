import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoiceService';
import { CreateInvoiceData, RegisterPaymentData } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const invoiceKeys = {
  all: ['invoices'] as const,
  preview: (odontogramId: string) => [...invoiceKeys.all, 'preview', odontogramId] as const,
  detail: (invoiceId: string) => [...invoiceKeys.all, 'detail', invoiceId] as const,
  byPatient: (patientId: string) => [...invoiceKeys.all, 'patient', patientId] as const,
  revenue: (start?: string, end?: string) => [...invoiceKeys.all, 'revenue', start, end] as const,
};

export function useInvoicePreview(odontogramId: string, enabled = false) {
  return useQuery({
    queryKey: invoiceKeys.preview(odontogramId),
    queryFn: () => invoiceService.getPreview(odontogramId),
    enabled: !!odontogramId && enabled,
  });
}

export function useInvoiceById(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: () => invoiceService.getById(invoiceId),
    enabled: !!invoiceId && enabled,
  });
}

export function useInvoicesByPatient(patientId: string) {
  return useQuery({
    queryKey: invoiceKeys.byPatient(patientId),
    queryFn: () => invoiceService.getByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useRevenue(startDate?: string, endDate?: string, enabled = true) {
  return useQuery({
    queryKey: invoiceKeys.revenue(startDate, endDate),
    queryFn: () => invoiceService.getRevenue(startDate, endDate),
    enabled,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => invoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success(t('invoices.invoiceCreated'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RegisterPaymentData) => invoiceService.registerPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success(t('invoices.paymentRegistered'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ invoiceId, reason }: { invoiceId: string; reason: string }) =>
      invoiceService.cancel(invoiceId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success(t('invoices.invoiceCancelled'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
