import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, Globe, Hash } from 'lucide-react';
import { useInvoicePreview } from '@/hooks/useInvoice';
import { InvoiceTreatmentLine } from '@/types';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  odontogramId: string;
  patientName?: string;
}

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  odontogramId,
  patientName,
}: InvoicePreviewDialogProps) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: invoice, isLoading, isError, error } = useInvoicePreview(odontogramId, open);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura - ${invoice?.patientName || patientName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #1a1a1a; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
            th { font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #666; }
            .text-right { text-align: right; }
            .total-row { font-weight: 700; font-size: 1.1rem; border-top: 2px solid #1a1a1a; }
            .section-title { font-weight: 600; margin: 1.5rem 0 0.5rem; font-size: 0.9rem; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; background: #f0f0f0; }
            h1 { margin: 0 0 0.25rem; }
            .subtitle { color: #666; margin: 0 0 2rem; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount: number) => `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('invoices.preview')}</span>
            {invoice && (
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                {t('common.print')}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {patientName || invoice?.patientName || t('invoices.unpaidTreatments')}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">{(error as Error)?.message || t('invoices.noUnpaid')}</p>
          </div>
        )}

        {invoice && (
          <div ref={printRef}>
            <h1 className="text-lg font-bold">{t('invoices.invoiceTitle')}</h1>
            <p className="subtitle text-sm text-muted-foreground mb-4">
              {t('invoices.patient')}: {invoice.patientName}
            </p>

            {/* Global Treatments */}
            {invoice.globalTreatments.length > 0 && (
              <>
                <div className="section-title flex items-center gap-2 text-sm font-semibold mt-4 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('treatments.globalTreatments')}
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('treatments.code')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('common.name')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.qty')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.unitPrice')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.globalTreatments.map((item, i) => (
                        <TreatmentRow key={i} item={item} formatCurrency={formatCurrency} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Tooth Treatments */}
            {invoice.toothTreatments.length > 0 && (
              <>
                <div className="section-title flex items-center gap-2 text-sm font-semibold mt-4 mb-2">
                  <Hash className="h-4 w-4 text-primary" />
                  {t('treatments.toothTreatments')}
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('treatments.code')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('common.name')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('odontogram.tooth')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.qty')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.unitPrice')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.toothTreatments.map((item, i) => (
                        <TreatmentRow key={i} item={item} formatCurrency={formatCurrency} showTeeth />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Totals */}
            <div className="mt-4 space-y-1 ml-auto w-64">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.tax')}</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.discount')}</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>{t('common.total')}</span>
                <span className="text-primary">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TreatmentRow({ 
  item, 
  formatCurrency, 
  showTeeth = false 
}: { 
  item: InvoiceTreatmentLine; 
  formatCurrency: (n: number) => string; 
  showTeeth?: boolean;
}) {
  return (
    <tr className="border-t border-border/50">
      <td className="px-3 py-2">
        <Badge variant="outline" className="text-xs font-mono">{item.treatmentCode}</Badge>
      </td>
      <td className="px-3 py-2 font-medium">{item.treatmentName}</td>
      {showTeeth && (
        <td className="px-3 py-2 text-muted-foreground">
          {item.toothNumbers?.join(', ') || '-'}
        </td>
      )}
      <td className="px-3 py-2 text-right">{item.quantity}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
    </tr>
  );
}
