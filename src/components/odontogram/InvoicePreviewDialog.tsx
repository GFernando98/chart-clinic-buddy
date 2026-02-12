import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Globe, Hash, Receipt, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { useInvoicePreview, useCreateInvoice } from '@/hooks/useInvoice';
import { useClinicInformation } from '@/hooks/useClinicInformation';
import { InvoiceTreatmentLine, Invoice } from '@/types';
import { printInvoice } from '@/utils/printInvoice';

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
  const { data: preview, isLoading, isError, error } = useInvoicePreview(odontogramId, open);
  const { data: clinic } = useClinicInformation();
  const createInvoice = useCreateInvoice();

  // State for creation flow
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const formatCurrency = (amount: number) => `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  // Collect all treatment IDs from preview
  const allTreatmentIds = React.useMemo(() => {
    if (!preview) return [];
    const ids: string[] = [];
    [...preview.globalTreatments, ...preview.toothTreatments].forEach((item) => {
      if (item.treatmentRecordId) ids.push(item.treatmentRecordId);
      if (item.treatmentRecordIds) ids.push(...item.treatmentRecordIds);
    });
    return ids;
  }, [preview]);

  // Auto-select all when preview loads (only when no invoice has been created)
  React.useEffect(() => {
    if (preview && allTreatmentIds.length > 0 && selectedTreatmentIds.length === 0 && !createdInvoice) {
      setSelectedTreatmentIds([...allTreatmentIds]);
    }
  }, [preview, allTreatmentIds]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedTreatmentIds(checked ? [...allTreatmentIds] : []);
  };

  const toggleLineItem = (item: InvoiceTreatmentLine) => {
    const ids = item.treatmentRecordIds || (item.treatmentRecordId ? [item.treatmentRecordId] : []);
    const allSelected = ids.every((id) => selectedTreatmentIds.includes(id));
    if (allSelected) {
      setSelectedTreatmentIds((prev) => prev.filter((x) => !ids.includes(x)));
    } else {
      setSelectedTreatmentIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const isLineSelected = (item: InvoiceTreatmentLine) => {
    const ids = item.treatmentRecordIds || (item.treatmentRecordId ? [item.treatmentRecordId] : []);
    return ids.length > 0 && ids.every((id) => selectedTreatmentIds.includes(id));
  };

  const handleGenerateInvoice = async () => {
    if (!odontogramId || selectedTreatmentIds.length === 0 || createdInvoice) return;
    try {
      const invoice = await createInvoice.mutateAsync({
        odontogramId,
        treatmentRecordIds: selectedTreatmentIds,
        discountPercentage: discountPct ? parseFloat(discountPct) : undefined,
        notes: invoiceNotes || undefined,
      });
      setCreatedInvoice(invoice);
    } catch {
      // error handled by hook
    }
  };

  const handlePrint = () => {
    if (!createdInvoice) return;
    printInvoice({ invoice: createdInvoice, clinic: clinic || null });
  };

  const handleWhatsApp = () => {
    if (!createdInvoice) return;
    const msg = encodeURIComponent(
      `Factura ${createdInvoice.invoiceNumber}\nTotal: ${formatCurrency(createdInvoice.total)}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    if (!createdInvoice) return;
    const subject = encodeURIComponent(`Factura ${createdInvoice.invoiceNumber}`);
    const body = encodeURIComponent(
      `Factura: ${createdInvoice.invoiceNumber}\nTotal: ${formatCurrency(createdInvoice.total)}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCreatedInvoice(null);
      setSelectedTreatmentIds([]);
      setDiscountPct('');
      setInvoiceNotes('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdInvoice
              ? <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" />{t('invoices.invoiceCreated')}</span>
              : t('invoices.preview')
            }
          </DialogTitle>
          <DialogDescription>
            {patientName || preview?.patientName || t('invoices.unpaidTreatments')}
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-medium">{(error as Error)?.message || t('invoices.noUnpaid')}</p>
          </div>
        )}

        {/* ===== POST-CREATION: Invoice created successfully ===== */}
        {createdInvoice && (
          <div>
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('invoices.invoiceNumber')}</p>
                    <p className="text-lg font-bold">{createdInvoice.invoiceNumber}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">{t('invoices.statusPending')}</Badge>
                </div>
                {createdInvoice.cai && (
                  <p className="text-xs text-muted-foreground mt-1">CAI: {createdInvoice.cai}</p>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.total')}</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(createdInvoice.total)}</span>
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" onClick={handlePrint} className="flex flex-col items-center gap-1 h-auto py-3">
                  <Printer className="h-5 w-5" />
                  <span className="text-xs">{t('common.print')}</span>
                </Button>
                <Button variant="outline" onClick={handleWhatsApp} className="flex flex-col items-center gap-1 h-auto py-3">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button variant="outline" onClick={handleEmail} className="flex flex-col items-center gap-1 h-auto py-3">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs">{t('common.email')}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRE-CREATION: Preview with treatment selection ===== */}
        {preview && !createdInvoice && (
          <div className="space-y-4">
            {/* Select all */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-preview"
                checked={allTreatmentIds.length > 0 && selectedTreatmentIds.length === allTreatmentIds.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all-preview" className="text-sm font-medium">
                {t('invoices.allTreatments')} ({allTreatmentIds.length})
              </Label>
            </div>

            <Separator />

            {/* Global Treatments */}
            {preview.globalTreatments.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('treatments.globalTreatments')}
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('treatments.code')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('common.name')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.qty')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.unitPrice')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.globalTreatments.map((item, i) => (
                        <TreatmentRow key={i} item={item} formatCurrency={formatCurrency} selected={isLineSelected(item)} onToggle={() => toggleLineItem(item)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Tooth Treatments */}
            {preview.toothTreatments.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Hash className="h-4 w-4 text-primary" />
                  {t('treatments.toothTreatments')}
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('treatments.code')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('common.name')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('odontogram.tooth')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.qty')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.unitPrice')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.toothTreatments.map((item, i) => (
                        <TreatmentRow key={i} item={item} formatCurrency={formatCurrency} showTeeth selected={isLineSelected(item)} onToggle={() => toggleLineItem(item)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Discount & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('invoices.discountPercentage')}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.notes')} ({t('common.optional')})</Label>
                <Textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="ml-auto w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                <span>{formatCurrency(preview.subtotal)}</span>
              </div>
              {preview.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.tax')}</span>
                  <span>{formatCurrency(preview.tax)}</span>
                </div>
              )}
              {preview.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.discount')}</span>
                  <span>-{formatCurrency(preview.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>{t('common.total')}</span>
                <span className="text-primary">{formatCurrency(preview.total)}</span>
              </div>
            </div>

            {/* Generate Invoice Button */}
            <Button
              className="w-full"
              onClick={handleGenerateInvoice}
              disabled={selectedTreatmentIds.length === 0 || createInvoice.isPending}
            >
              <Receipt className="w-4 h-4 mr-2" />
              {createInvoice.isPending ? t('common.saving') : t('invoices.generateInvoice')}
              {selectedTreatmentIds.length > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedTreatmentIds.length}</Badge>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TreatmentRow({ 
  item, 
  formatCurrency, 
  showTeeth = false,
  selected,
  onToggle,
}: { 
  item: InvoiceTreatmentLine; 
  formatCurrency: (n: number) => string; 
  showTeeth?: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="border-t border-border/50">
      <td className="px-3 py-2">
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      </td>
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
