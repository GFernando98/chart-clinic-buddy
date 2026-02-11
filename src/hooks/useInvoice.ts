import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoiceService';

export const invoiceKeys = {
  all: ['invoices'] as const,
  preview: (odontogramId: string) => [...invoiceKeys.all, 'preview', odontogramId] as const,
};

export function useInvoicePreview(odontogramId: string, enabled = false) {
  return useQuery({
    queryKey: invoiceKeys.preview(odontogramId),
    queryFn: () => invoiceService.getPreview(odontogramId),
    enabled: !!odontogramId && enabled,
  });
}
