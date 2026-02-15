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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDown, Globe, Hash, Receipt, MessageCircle, Mail, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { useInvoicePreview, useCreateInvoice, useRegisterPayment } from '@/hooks/useInvoice';
import { useClinicInformation } from '@/hooks/useClinicInformation';
import { useTaxInformation } from '@/hooks/useTaxInformation';
import { InvoiceTreatmentLine, Invoice, PaymentMethod } from '@/types';
import { generateInvoicePdf } from '@/utils/generateInvoicePdf';

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
  const { data: taxInfoList } = useTaxInformation();
  const createInvoice = useCreateInvoice();
  const registerPayment = useRegisterPayment();

  // State for creation flow
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  // Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('1');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const formatCurrency = (amount: number) => `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  const activeTaxInfo = taxInfoList?.find((ti) => ti.isActive) || null;

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
      setPaymentAmount(invoice.total.toString());
    } catch {
      // error handled by hook
    }
  };

  const handleDownloadPdf = () => {
    if (!createdInvoice) return;
    generateInvoicePdf({
      invoice: createdInvoice,
      clinic: clinic || null,
      taxInfo: activeTaxInfo,
    });
  };

  const handleRegisterPayment = async () => {
    if (!createdInvoice || !paymentAmount) return;
    try {
      await registerPayment.mutateAsync({
        invoiceId: createdInvoice.id,
        amount: parseFloat(paymentAmount),
        paymentMethod: parseInt(paymentMethod) as PaymentMethod,
        referenceNumber: paymentRef || undefined,
        notes: paymentNotes || undefined,
      });
      // Update local invoice state
      const paidAmount = parseFloat(paymentAmount);
      setCreatedInvoice((prev) => prev ? {
        ...prev,
        amountPaid: prev.amountPaid + paidAmount,
        balance: prev.balance - paidAmount,
      } : null);
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentNotes('');
    } catch {
      // error handled by hook
    }
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
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentNotes('');
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.total')}</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(createdInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('invoices.balance')}</span>
                <span className="text-lg font-bold">{formatCurrency(createdInvoice.balance)}</span>
              </div>
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={handleDownloadPdf} disabled={createdInvoice.amountPaid <= 0} className="flex flex-col items-center gap-1 h-auto py-3">
                <FileDown className="h-5 w-5" />
                <span className="text-xs">PDF</span>
              </Button>
              <Button variant="outline" onClick={handleWhatsApp} disabled={createdInvoice.amountPaid <= 0} className="flex flex-col items-center gap-1 h-auto py-3">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button variant="outline" onClick={handleEmail} disabled={createdInvoice.amountPaid <= 0} className="flex flex-col items-center gap-1 h-auto py-3">
                <Mail className="h-5 w-5" />
                <span className="text-xs">{t('common.email')}</span>
              </Button>
              <Button
                variant={showPaymentForm ? 'secondary' : 'default'}
                onClick={() => {
                  setShowPaymentForm(!showPaymentForm);
                  if (!showPaymentForm) setPaymentAmount(createdInvoice.balance.toString());
                }}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">{t('invoices.registerPayment')}</span>
              </Button>
            </div>

            {/* Payment form */}
            {showPaymentForm && createdInvoice.balance > 0 && (
              <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('invoices.registerPayment')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('invoices.amount')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={createdInvoice.balance}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('invoices.paymentMethod')}</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t('invoices.paymentCash')}</SelectItem>
                        <SelectItem value="2">{t('invoices.paymentCreditCard')}</SelectItem>
                        <SelectItem value="3">{t('invoices.paymentDebitCard')}</SelectItem>
                        <SelectItem value="4">{t('invoices.paymentBankTransfer')}</SelectItem>
                        <SelectItem value="5">{t('invoices.paymentCheck')}</SelectItem>
                        <SelectItem value="6">{t('invoices.paymentOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('invoices.referenceNumber')} ({t('common.optional')})</Label>
                    <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('common.notes')} ({t('common.optional')})</Label>
                    <Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleRegisterPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || registerPayment.isPending}
                >
                  {registerPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('invoices.registerPayment')} - {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : ''}
                </Button>
              </div>
            )}

            {showPaymentForm && createdInvoice.balance <= 0 && (
              <div className="rounded-lg border p-4 bg-green-500/10 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-700 dark:text-green-400">{t('invoices.statusPaid')}</p>
              </div>
            )}
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
