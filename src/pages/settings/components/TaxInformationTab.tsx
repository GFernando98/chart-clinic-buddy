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
  Plus, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, Power,
} from 'lucide-react';
import {
  useTaxInformation, useCreateTaxInformation, useToggleTaxInformation,
} from '@/hooks/useTaxInformation';
import { InvoiceType, TaxInformation, TaxInformationFormData } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const invoiceTypeKeys: Record<InvoiceType, string> = {
  [InvoiceType.Factura]: 'factura',
  [InvoiceType.Recibo]: 'recibo',
  [InvoiceType.NotaCredito]: 'notaCredito',
  [InvoiceType.NotaDebito]: 'notaDebito',
};

function getCAIStatus(tax: TaxInformation) {
  if (!tax.isActive) return { variant: 'secondary' as const, icon: XCircle, key: 'common.inactive' };
  if (tax.isExpired) return { variant: 'destructive' as const, icon: AlertTriangle, key: 'tax.expired' };
  if (tax.isExhausted) return { variant: 'destructive' as const, icon: XCircle, key: 'tax.exhausted' };
  if (tax.remainingInvoices <= 10) return { variant: 'warning' as const, icon: AlertTriangle, key: 'tax.almostExhausted' };
  return { variant: 'success' as const, icon: CheckCircle2, key: 'common.active' };
}

function canToggle(tax: TaxInformation, activate: boolean): boolean {
  if (!activate) return true; // always can deactivate
  return !tax.hasBeenUsed && !tax.isExpired && !tax.isExhausted;
}

const statusBadgeClasses: Record<string, string> = {
  success: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  destructive: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  warning: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  secondary: 'bg-muted text-muted-foreground',
};

export function TaxInformationTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;
  const { data: taxInfos = [], isLoading } = useTaxInformation();
  const createTax = useCreateTaxInformation();
  const toggleTax = useToggleTaxInformation();

  const [formOpen, setFormOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<{ id: string; activate: boolean } | null>(null);
  const [form, setForm] = useState<TaxInformationFormData>({
    cai: '', invoiceType: InvoiceType.Factura,
    rangeStart: '00000001', rangeEnd: '00010000',
    branch: '001', pointEmission: '001',
    authorizationDate: '', expirationDate: '',
  });

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale }); }
    catch { return d; }
  };

  const handleCreate = async () => {
    const formatted: TaxInformationFormData = {
      ...form,
      branch: form.branch.padStart(3, '0'),
      pointEmission: form.pointEmission.padStart(3, '0'),
      rangeStart: form.rangeStart.padStart(8, '0'),
      rangeEnd: form.rangeEnd.padStart(8, '0'),
    };
    await createTax.mutateAsync(formatted);
    setFormOpen(false);
    setForm({
      cai: '', invoiceType: InvoiceType.Factura,
      rangeStart: '00000001', rangeEnd: '00010000',
      branch: '001', pointEmission: '001',
      authorizationDate: '', expirationDate: '',
    });
  };

  const handleToggle = async () => {
    if (toggleTarget) {
      await toggleTax.mutateAsync(toggleTarget);
      setToggleTarget(null);
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
                {taxInfos.map((tax) => {
                  const status = getCAIStatus(tax);
                  const StatusIcon = status.icon;
                  const nextActivate = !tax.isActive;
                  const toggleEnabled = canToggle(tax, nextActivate);
                  // Don't show toggle for expired/exhausted inactive CAIs
                  const showToggle = tax.isActive || toggleEnabled;

                  return (
                    <TableRow key={tax.id}>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {tax.cai}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`tax.${invoiceTypeKeys[tax.invoiceType]}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {tax.currentNumber}/{tax.rangeEnd}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tax.remainingInvoices <= 10 ? 'destructive' : 'secondary'}>
                          {tax.remainingInvoices}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(tax.expirationDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClasses[status.variant]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {t(status.key)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {showToggle && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToggleTarget({ id: tax.id, activate: nextActivate })}
                            title={nextActivate ? t('tax.activate') : t('tax.deactivate')}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                <Label>{t('tax.branch')}</Label>
                <Input
                  value={form.branch}
                  onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('tax.pointEmission')}</Label>
                <Input
                  value={form.pointEmission}
                  onChange={(e) => setForm((p) => ({ ...p, pointEmission: e.target.value }))}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('tax.rangeStart')}</Label>
                <Input
                  value={form.rangeStart}
                  onChange={(e) => setForm((p) => ({ ...p, rangeStart: e.target.value }))}
                  placeholder="00000001"
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('tax.rangeEnd')}</Label>
                <Input
                  value={form.rangeEnd}
                  onChange={(e) => setForm((p) => ({ ...p, rangeEnd: e.target.value }))}
                  placeholder="00010000"
                  maxLength={8}
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

      {/* Toggle Confirm */}
      <AlertDialog open={!!toggleTarget} onOpenChange={(open) => !open && setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.activate ? t('tax.activate') : t('tax.deactivate')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.activate ? t('tax.activateConfirm') : t('tax.deactivateConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
