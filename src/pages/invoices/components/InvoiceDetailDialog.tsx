import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, DollarSign, XCircle } from 'lucide-react';
import { Invoice, InvoiceStatus, PaymentMethod } from '@/types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { RegisterPaymentDialog } from './RegisterPaymentDialog';
import { useCancelInvoice } from '@/hooks/useInvoice';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onRefresh?: () => void;
}

const paymentMethodKeys: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'paymentCash',
  [PaymentMethod.CreditCard]: 'paymentCreditCard',
  [PaymentMethod.DebitCard]: 'paymentDebitCard',
  [PaymentMethod.BankTransfer]: 'paymentBankTransfer',
  [PaymentMethod.Check]: 'paymentCheck',
  [PaymentMethod.Other]: 'paymentOther',
};

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  onRefresh,
}: InvoiceDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;
  const { hasRole } = useAuth();
  const cancelInvoice = useCancelInvoice();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale }); }
    catch { return d; }
  };

  const canPay = invoice.status !== InvoiceStatus.Cancelled && invoice.status !== InvoiceStatus.Paid;
  const canCancel = invoice.status !== InvoiceStatus.Cancelled && invoice.payments.length === 0 && hasRole(['Admin']);

  const handleCancel = async () => {
    await cancelInvoice.mutateAsync({ invoiceId: invoice.id, reason: cancelReason });
    setCancelOpen(false);
    setCancelReason('');
    onRefresh?.();
  };

  const handlePrint = () => window.print();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <DialogTitle className="text-lg">{invoice.invoiceNumber}</DialogTitle>
                <DialogDescription className="space-y-0.5">
                  <span className="block">{t('invoices.patient')}: {invoice.patientName}</span>
                  {invoice.cai && (
                    <span className="block text-xs">CAI: {invoice.cai}</span>
                  )}
                  {!invoice.cai && (
                    <span className="block text-xs text-muted-foreground">({t('invoices.noCai')})</span>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <InvoiceStatusBadge status={invoice.status} />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Line Items */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('common.description')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{t('odontogram.tooth')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.qty')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.unitPrice')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">{t('invoices.subtotal')}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="px-3 py-2 font-medium">{item.description}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.toothNumbers || '-'}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto w-64 space-y-1">
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
            <div className="flex justify-between font-bold text-base">
              <span>{t('common.total')}</span>
              <span className="text-primary">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('invoices.amountPaid')}</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t('invoices.balance')}</span>
              <span className={invoice.balance > 0 ? 'text-orange-600' : 'text-green-600'}>
                {formatCurrency(invoice.balance)}
              </span>
            </div>
          </div>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">{t('invoices.paymentHistory')}</h4>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                    <div>
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                      <span className="text-muted-foreground ml-2">
                        {t(`invoices.${paymentMethodKeys[p.paymentMethod]}`)}
                      </span>
                      {p.referenceNumber && (
                        <span className="text-muted-foreground ml-1">({p.referenceNumber})</span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">{formatDate(p.paymentDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2">
            {canCancel && (
              <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                <XCircle className="h-4 w-4 mr-1" />
                {t('invoices.cancelInvoice')}
              </Button>
            )}
            {canPay && (
              <Button size="sm" onClick={() => setPaymentOpen(true)}>
                <DollarSign className="h-4 w-4 mr-1" />
                {t('invoices.registerPayment')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RegisterPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        invoiceId={invoice.id}
        balance={invoice.balance}
        onSuccess={onRefresh}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoices.cancelInvoice')}</AlertDialogTitle>
            <AlertDialogDescription>{t('invoices.cancellationReason')}</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={t('invoices.cancellationReason')}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={!cancelReason || cancelInvoice.isPending}
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
