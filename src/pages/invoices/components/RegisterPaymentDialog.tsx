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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentMethod } from '@/types';
import { useRegisterPayment } from '@/hooks/useInvoice';

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  balance: number;
  onSuccess?: () => void;
}

const paymentMethodKeys: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'paymentCash',
  [PaymentMethod.CreditCard]: 'paymentCreditCard',
  [PaymentMethod.DebitCard]: 'paymentDebitCard',
  [PaymentMethod.BankTransfer]: 'paymentBankTransfer',
  [PaymentMethod.Check]: 'paymentCheck',
  [PaymentMethod.Other]: 'paymentOther',
};

export function RegisterPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  balance,
  onSuccess,
}: RegisterPaymentDialogProps) {
  const { t } = useTranslation();
  const registerPayment = useRegisterPayment();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('1');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || numAmount > balance) return;

    await registerPayment.mutateAsync({
      invoiceId,
      amount: numAmount,
      paymentMethod: parseInt(paymentMethod) as PaymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });

    setAmount('');
    setPaymentMethod('1');
    setReferenceNumber('');
    setNotes('');
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invoices.registerPayment')}</DialogTitle>
          <DialogDescription>
            {t('invoices.balance')}: {formatCurrency(balance)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('invoices.amount')}</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${formatCurrency(balance)}`}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('invoices.paymentMethod')}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodKeys).map(([value, key]) => (
                  <SelectItem key={value} value={value}>
                    {t(`invoices.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('invoices.referenceNumber')} ({t('common.optional')})</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('common.notes')} ({t('common.optional')})</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || registerPayment.isPending}
          >
            {registerPayment.isPending ? t('common.saving') : t('invoices.registerPayment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
