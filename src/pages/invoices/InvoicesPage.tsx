import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, User, Eye } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useInvoicesByPatient } from '@/hooks/useInvoice';
import { InvoiceStatusBadge } from './components/InvoiceStatusBadge';
import { InvoiceDetailDialog } from './components/InvoiceDetailDialog';
import { Invoice } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function InvoicesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: invoices = [], isLoading: loadingInvoices, refetch: refetchInvoices } = useInvoicesByPatient(selectedPatientId);

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale }); }
    catch { return d; }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
        <p className="text-muted-foreground">{t('invoices.subtitle')}</p>
      </div>

      {/* Patient filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>{t('invoices.patient')}</Label>
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
              disabled={loadingPatients}
            >
              <SelectTrigger className="w-[280px]">
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
        </CardContent>
      </Card>

      {/* Loading */}
      {loadingInvoices && selectedPatientId && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Empty states */}
      {!selectedPatientId && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('invoices.emptyTitle')}</h3>
            <p className="text-muted-foreground text-center max-w-md">{t('invoices.emptyDescription')}</p>
          </CardContent>
        </Card>
      )}

      {!loadingInvoices && selectedPatientId && invoices.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('invoices.noInvoices')}</h3>
            <p className="text-muted-foreground text-center max-w-md">{t('invoices.noInvoicesDescription')}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoice list */}
      {invoices.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('invoices.invoiceNumber')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t('invoices.invoiceDate')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t('common.total')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t('invoices.balance')}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">{t('common.status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <div>
                        {inv.invoiceNumber}
                        {inv.cai && <span className="block text-xs text-muted-foreground">CAI: {inv.cai.slice(0, 12)}...</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={inv.balance > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                        {formatCurrency(inv.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedInvoice(inv); setDetailOpen(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedInvoice && (
        <InvoiceDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          invoice={selectedInvoice}
          onRefresh={() => refetchInvoices()}
        />
      )}
    </div>
  );
}
