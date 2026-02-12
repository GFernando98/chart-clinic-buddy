import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Plus, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import {
  useTaxInformation, useCreateTaxInformation, useDeactivateTaxInformation,
} from '@/hooks/useTaxInformation';
import { InvoiceType, TaxInformationFormData } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const invoiceTypeKeys: Record<InvoiceType, string> = {
  [InvoiceType.Factura]: 'factura',
  [InvoiceType.Recibo]: 'recibo',
  [InvoiceType.NotaCredito]: 'notaCredito',
  [InvoiceType.NotaDebito]: 'notaDebito',
};

export function TaxInformationTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;
  const { data: taxInfos = [], isLoading } = useTaxInformation();
  const createTax = useCreateTaxInformation();
  const deactivate = useDeactivateTaxInformation();

  const [formOpen, setFormOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [form, setForm] = useState<TaxInformationFormData>({
    cai: '', invoiceType: InvoiceType.Factura,
    rangeStart: 1, rangeEnd: 10000,
    authorizationDate: '', expirationDate: '',
  });

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale }); }
    catch { return d; }
  };

  const handleCreate = async () => {
    await createTax.mutateAsync(form);
    setFormOpen(false);
    setForm({
      cai: '', invoiceType: InvoiceType.Factura,
      rangeStart: 1, rangeEnd: 10000,
      authorizationDate: '', expirationDate: '',
    });
  };

  const handleDeactivate = async () => {
    if (deactivateId) {
      await deactivate.mutateAsync(deactivateId);
      setDeactivateId(null);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {t('tax.title')}
              </CardTitle>
              <CardDescription>
                {t('common.showing')} {taxInfos.length} {t('common.results')}
              </CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('tax.newCai')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {taxInfos.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">{t('tax.noCai')}</h3>
              <p className="text-muted-foreground mt-2">{t('tax.noCaiDescription')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tax.cai')}</TableHead>
                  <TableHead>{t('tax.invoiceType')}</TableHead>
                  <TableHead className="text-center">{t('tax.currentNumber')}</TableHead>
                  <TableHead className="text-center">{t('tax.remaining')}</TableHead>
                  <TableHead>{t('tax.expirationDate')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxInfos.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {tax.cai}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`tax.${invoiceTypeKeys[tax.invoiceType]}`)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{tax.currentNumber}/{tax.rangeEnd}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={tax.remainingInvoices < 100 ? 'destructive' : 'secondary'}>
                        {tax.remainingInvoices}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(tax.expirationDate)}</TableCell>
                    <TableCell>
                      {tax.isExpired ? (
                        <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t('tax.expired')}
                        </Badge>
                      ) : tax.isActive ? (
                        <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('common.active')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t('common.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {tax.isActive && !tax.isExpired && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivateId(tax.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create CAI Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('tax.newCai')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('tax.cai')}</Label>
              <Input
                value={form.cai}
                onChange={(e) => setForm((p) => ({ ...p, cai: e.target.value }))}
                placeholder="ABC123-456789-012345-678901-234567-89"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('tax.invoiceType')}</Label>
              <Select
                value={String(form.invoiceType)}
                onValueChange={(v) => setForm((p) => ({ ...p, invoiceType: parseInt(v) as InvoiceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(invoiceTypeKeys).map(([val, key]) => (
                    <SelectItem key={val} value={val}>{t(`tax.${key}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('tax.rangeStart')}</Label>
                <Input
                  type="number"
                  value={form.rangeStart}
                  onChange={(e) => setForm((p) => ({ ...p, rangeStart: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('tax.rangeEnd')}</Label>
                <Input
                  type="number"
                  value={form.rangeEnd}
                  onChange={(e) => setForm((p) => ({ ...p, rangeEnd: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('tax.authorizationDate')}</Label>
                <Input
                  type="date"
                  value={form.authorizationDate ? form.authorizationDate.slice(0, 10) : ''}
                  onChange={(e) => setForm((p) => ({ ...p, authorizationDate: e.target.value + 'T00:00:00Z' }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('tax.expirationDate')}</Label>
                <Input
                  type="date"
                  value={form.expirationDate ? form.expirationDate.slice(0, 10) : ''}
                  onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value + 'T23:59:59Z' }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={!form.cai || createTax.isPending}>
              {createTax.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm */}
      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tax.deactivate')}</AlertDialogTitle>
            <AlertDialogDescription>{t('tax.deactivateConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
