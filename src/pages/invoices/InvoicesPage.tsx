import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, User, Printer, Eye, Plus, DollarSign,
  TrendingUp, BarChart3, List, Receipt,
} from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { usePatientOdontograms } from '@/hooks/useOdontogram';
import {
  useInvoicePreview, useInvoicesByPatient,
  useCreateInvoice, useRevenue,
} from '@/hooks/useInvoice';
import { InvoiceStatusBadge } from './components/InvoiceStatusBadge';
import { InvoiceDetailDialog } from './components/InvoiceDetailDialog';
import {
  Invoice, InvoicePreview, InvoiceTreatmentLine,
  PaymentMethod,
} from '@/types';
import { format, subMonths } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function InvoicesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  // State
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedOdontogramId, setSelectedOdontogramId] = useState('');
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Create invoice state
  const [createPatientId, setCreatePatientId] = useState('');
  const [createOdontogramId, setCreateOdontogramId] = useState('');
  const [createPreviewEnabled, setCreatePreviewEnabled] = useState(false);
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [discountPct, setDiscountPct] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Revenue state
  const now = new Date();
  const [revenueStart, setRevenueStart] = useState(format(subMonths(now, 1), 'yyyy-MM-dd'));
  const [revenueEnd, setRevenueEnd] = useState(format(now, 'yyyy-MM-dd'));

  // Queries
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: odontograms = [] } = usePatientOdontograms(selectedPatientId);
  const { data: invoices = [], isLoading: loadingInvoices, refetch: refetchInvoices } = useInvoicesByPatient(selectedPatientId);

  // Create tab queries
  const { data: createOdontograms = [] } = usePatientOdontograms(createPatientId);
  const { data: createPreview, isLoading: loadingCreatePreview } = useInvoicePreview(createOdontogramId, createPreviewEnabled);
  const createInvoice = useCreateInvoice();

  // Revenue query
  const { data: revenue, isLoading: loadingRevenue } = useRevenue(
    revenueStart, revenueEnd, activeTab === 'revenue'
  );

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale }); }
    catch { return d; }
  };

  // Collect all treatment record IDs from preview
  const allTreatmentIds = useMemo(() => {
    if (!createPreview) return [];
    const ids: string[] = [];
    createPreview.globalTreatments.forEach((item) => {
      if (item.treatmentRecordId) ids.push(item.treatmentRecordId);
      if (item.treatmentRecordIds) ids.push(...item.treatmentRecordIds);
    });
    createPreview.toothTreatments.forEach((item) => {
      if (item.treatmentRecordId) ids.push(item.treatmentRecordId);
      if (item.treatmentRecordIds) ids.push(...item.treatmentRecordIds);
    });
    return ids;
  }, [createPreview]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedTreatmentIds(checked ? [...allTreatmentIds] : []);
  };

  const toggleTreatmentId = (id: string) => {
    setSelectedTreatmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  const handleCreateInvoice = async () => {
    if (!createOdontogramId || selectedTreatmentIds.length === 0) return;
    await createInvoice.mutateAsync({
      odontogramId: createOdontogramId,
      treatmentRecordIds: selectedTreatmentIds,
      discountPercentage: discountPct ? parseFloat(discountPct) : undefined,
      notes: invoiceNotes || undefined,
    });
    // Reset
    setSelectedTreatmentIds([]);
    setDiscountPct('');
    setInvoiceNotes('');
    setCreatePreviewEnabled(false);
    setActiveTab('list');
    setSelectedPatientId(createPatientId);
    refetchInvoices();
  };

  const handlePreviewForCreate = () => {
    if (createOdontogramId) {
      setCreatePreviewEnabled(true);
      setSelectedTreatmentIds([]);
    }
  };

  const paymentMethodLabel = (method: PaymentMethod) => {
    const keys: Record<number, string> = {
      1: 'paymentCash', 2: 'paymentCreditCard', 3: 'paymentDebitCard',
      4: 'paymentBankTransfer', 5: 'paymentCheck', 6: 'paymentOther',
    };
    return t(`invoices.${keys[method] || 'paymentOther'}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
        <p className="text-muted-foreground">{t('invoices.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            {t('invoices.tabList')}
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('invoices.tabCreate')}
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('invoices.tabRevenue')}
          </TabsTrigger>
        </TabsList>

        {/* ==================== LIST TAB ==================== */}
        <TabsContent value="list" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>{t('invoices.patient')}</Label>
                  <Select
                    value={selectedPatientId}
                    onValueChange={(v) => { setSelectedPatientId(v); }}
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
              </div>
            </CardContent>
          </Card>

          {loadingInvoices && selectedPatientId && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-8 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
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

          {!selectedPatientId && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('invoices.emptyTitle')}</h3>
                <p className="text-muted-foreground text-center max-w-md">{t('invoices.emptyDescription')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== CREATE TAB ==================== */}
        <TabsContent value="create" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>{t('invoices.patient')}</Label>
                  <Select
                    value={createPatientId}
                    onValueChange={(v) => {
                      setCreatePatientId(v);
                      setCreateOdontogramId('');
                      setCreatePreviewEnabled(false);
                      setSelectedTreatmentIds([]);
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

                {createPatientId && (
                  <div className="space-y-2">
                    <Label>{t('odontogram.title')}</Label>
                    <Select
                      value={createOdontogramId}
                      onValueChange={(v) => {
                        setCreateOdontogramId(v);
                        setCreatePreviewEnabled(false);
                        setSelectedTreatmentIds([]);
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={t('odontogram.selectOdontogram')} />
                      </SelectTrigger>
                      <SelectContent>
                        {createOdontograms.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.examinationDate ? (() => {
                              try {
                                const d = new Date(o.examinationDate);
                                return isNaN(d.getTime()) ? o.id.slice(0, 8) : format(d, 'dd/MM/yyyy', { locale });
                              } catch { return o.id.slice(0, 8); }
                            })() : o.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handlePreviewForCreate} disabled={!createOdontogramId || loadingCreatePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('invoices.generatePreview')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loadingCreatePreview && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-8 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          )}

          {createPreview && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('invoices.selectTreatments')}</CardTitle>
                <CardDescription>
                  {t('invoices.patient')}: {createPreview.patientName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Select All */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={allTreatmentIds.length > 0 && selectedTreatmentIds.length === allTreatmentIds.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium">
                    {t('invoices.allTreatments')} ({allTreatmentIds.length})
                  </Label>
                </div>

                <Separator />

                {/* Treatment lines with checkboxes */}
                {[...createPreview.globalTreatments, ...createPreview.toothTreatments].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={isLineSelected(item)}
                      onCheckedChange={() => toggleLineItem(item)}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="text-xs font-mono mr-2">{item.treatmentCode}</Badge>
                        <span className="font-medium text-sm">{item.treatmentName}</span>
                        {item.toothNumbers && (
                          <span className="text-muted-foreground text-sm ml-2">
                            ({item.toothNumbers.join(', ')})
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-muted-foreground mr-2">×{item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

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

                {/* Total preview */}
                <div className="ml-auto w-64 space-y-1 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                    <span>{formatCurrency(createPreview.subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>{t('common.total')}</span>
                    <span className="text-primary">{formatCurrency(createPreview.total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateInvoice}
                  disabled={selectedTreatmentIds.length === 0 || createInvoice.isPending}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  {createInvoice.isPending ? t('common.saving') : t('invoices.createInvoice')}
                  {selectedTreatmentIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{selectedTreatmentIds.length}</Badge>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== REVENUE TAB ==================== */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>{t('common.date')} - {t('invoices.tabList')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={revenueStart}
                      onChange={(e) => setRevenueStart(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={revenueEnd}
                      onChange={(e) => setRevenueEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingRevenue && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          )}

          {revenue && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{t('invoices.totalInvoices')}</p>
                    <p className="text-2xl font-bold">{revenue.totalInvoices}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{t('invoices.totalRevenue')}</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.totalRevenue)}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{t('invoices.totalPaid')}</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(revenue.totalPaid)}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{t('invoices.totalPending')}</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(revenue.totalPending)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Revenue Chart */}
              {revenue.dailyRevenue.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {t('invoices.dailyRevenue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenue.dailyRevenue.map((d) => ({
                        ...d,
                        dateLabel: format(new Date(d.date), 'dd/MM', { locale }),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateLabel" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => label}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method Breakdown */}
              {revenue.paymentMethodBreakdown.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('invoices.paymentBreakdown')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {revenue.paymentMethodBreakdown.map((pm) => (
                        <div key={pm.method} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-medium">{paymentMethodLabel(pm.method)}</span>
                            <Badge variant="secondary">{pm.count}</Badge>
                          </div>
                          <span className="font-bold">{formatCurrency(pm.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

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
