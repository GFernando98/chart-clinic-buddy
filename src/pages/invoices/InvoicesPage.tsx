import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Globe, Hash, Printer, Eye } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { usePatientOdontograms } from '@/hooks/useOdontogram';
import { useInvoicePreview } from '@/hooks/useInvoice';
import { InvoiceTreatmentLine } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function InvoicesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedOdontogramId, setSelectedOdontogramId] = useState<string>('');
  const [previewEnabled, setPreviewEnabled] = useState(false);

  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: odontograms = [], isLoading: loadingOdontograms } = usePatientOdontograms(selectedPatientId);
  const { data: invoice, isLoading: loadingInvoice, isError, error } = useInvoicePreview(selectedOdontogramId, previewEnabled);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const formatCurrency = (amount: number) => `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  const handlePreview = () => {
    if (selectedOdontogramId) {
      setPreviewEnabled(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
          <p className="text-muted-foreground">{t('invoices.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('invoices.patient')}</label>
              <Select
                value={selectedPatientId}
                onValueChange={(v) => {
                  setSelectedPatientId(v);
                  setSelectedOdontogramId('');
                  setPreviewEnabled(false);
                }}
                disabled={loadingPatients}
              >
                <SelectTrigger className="w-[220px]">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('appointments.selectPatient')} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatientId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('odontogram.title')}</label>
                <Select
                  value={selectedOdontogramId}
                  onValueChange={(v) => {
                    setSelectedOdontogramId(v);
                    setPreviewEnabled(false);
                  }}
                  disabled={loadingOdontograms}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={loadingOdontograms ? t('common.loading') : t('odontogram.selectOdontogram')} />
                  </SelectTrigger>
                  <SelectContent>
                    {odontograms.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.examinationDate ? (() => {
                          try {
                            const date = new Date(o.examinationDate);
                            return isNaN(date.getTime()) ? o.id.slice(0, 8) : format(date, 'dd/MM/yyyy', { locale });
                          } catch { return o.id.slice(0, 8); }
                        })() : o.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handlePreview}
              disabled={!selectedOdontogramId || loadingInvoice}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('invoices.generatePreview')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      {loadingInvoice && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{(error as Error)?.message || t('invoices.noUnpaid')}</p>
          </CardContent>
        </Card>
      )}

      {invoice && (
        <Card className="border-0 shadow-sm print:shadow-none" id="invoice-print">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{t('invoices.invoiceTitle')}</CardTitle>
                <CardDescription>
                  {t('invoices.patient')}: {invoice.patientName}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                {t('common.print')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Global Treatments */}
            {invoice.globalTreatments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('treatments.globalTreatments')}
                </h3>
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
                        <InvoiceRow key={i} item={item} formatCurrency={formatCurrency} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tooth Treatments */}
            {invoice.toothTreatments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Hash className="h-4 w-4 text-primary" />
                  {t('treatments.toothTreatments')}
                </h3>
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
                        <InvoiceRow key={i} item={item} formatCurrency={formatCurrency} showTeeth />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1">
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
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>{t('common.total')}</span>
                  <span className="text-primary">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!invoice && !loadingInvoice && !isError && !previewEnabled && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('invoices.emptyTitle')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t('invoices.emptyDescription')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvoiceRow({
  item,
  formatCurrency,
  showTeeth = false,
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
