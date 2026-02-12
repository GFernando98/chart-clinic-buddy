import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useAppointmentsByDay, useTreatmentsByCategory, useUpcomingAppointments } from '@/hooks/useDashboard';
import { useRevenue } from '@/hooks/useInvoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, Clock, ClipboardList, ArrowRight, Loader2, AlertCircle, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { AppointmentStatus, PaymentMethod } from '@/types';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const getStatusBadgeClass = (status: AppointmentStatus) => {
  const classes: Record<AppointmentStatus, string> = {
    [AppointmentStatus.Scheduled]: 'badge-scheduled',
    [AppointmentStatus.Confirmed]: 'badge-confirmed',
    [AppointmentStatus.InProgress]: 'badge-inprogress',
    [AppointmentStatus.Completed]: 'badge-completed',
    [AppointmentStatus.Cancelled]: 'badge-cancelled',
    [AppointmentStatus.NoShow]: 'badge-noshow',
  };
  return classes[status];
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const locale = i18n.language === 'es' ? es : enUS;
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: appointmentsByDay, isLoading: chartLoading } = useAppointmentsByDay();
  const { data: treatmentsByCategory, isLoading: pieLoading } = useTreatmentsByCategory();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useUpcomingAppointments(5);

  // Revenue
  const now = new Date();
  const [revenueStart, setRevenueStart] = useState(format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'));
  const [revenueEnd, setRevenueEnd] = useState(format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'));
  const { data: revenue, isLoading: loadingRevenue } = useRevenue(revenueStart, revenueEnd);

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

  const paymentMethodLabel = (method: PaymentMethod) => {
    const keys: Record<number, string> = {
      1: 'paymentCash', 2: 'paymentCreditCard', 3: 'paymentDebitCard',
      4: 'paymentBankTransfer', 5: 'paymentCheck', 6: 'paymentOther',
    };
    return t(`invoices.${keys[method] || 'paymentOther'}`);
  };

  const statCards = [
    { title: t('dashboard.todayAppointments'), value: stats?.todayAppointments ?? 0, icon: Calendar, color: 'text-info', bgColor: 'bg-info/10' },
    { title: t('dashboard.totalPatients'), value: stats?.totalPatients ?? 0, icon: Users, color: 'text-accent', bgColor: 'bg-accent/10' },
    { title: t('dashboard.pendingAppointments'), value: stats?.pendingAppointments ?? 0, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: t('dashboard.monthTreatments'), value: stats?.monthTreatments ?? 0, icon: ClipboardList, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('auth.welcomeBack')}, {user?.firstName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  {statsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : statsError ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appointments by Day */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('dashboard.appointmentsByDay')}</CardTitle>
            <CardDescription>{t('dashboard.last7Days')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : appointmentsByDay && appointmentsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">{t('common.noData')}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treatments by Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('dashboard.treatmentsByCategory')}</CardTitle>
            <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : treatmentsByCategory && treatmentsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={treatmentsByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {treatmentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">{t('common.noData')}</div>
              )}
            </div>
            {treatmentsByCategory && treatmentsByCategory.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {treatmentsByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('invoices.revenue')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={revenueStart} onChange={(e) => setRevenueStart(e.target.value)} className="w-auto h-9" />
            <Input type="date" value={revenueEnd} onChange={(e) => setRevenueEnd(e.target.value)} className="w-auto h-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loadingRevenue && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          )}

          {revenue && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">{t('invoices.totalInvoices')}</p>
                  <p className="text-xl font-bold">{revenue.totalInvoices}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">{t('invoices.totalRevenue')}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(revenue.totalRevenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">{t('invoices.totalPaid')}</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(revenue.totalPaid)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">{t('invoices.totalPending')}</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(revenue.totalPending)}</p>
                </div>
              </div>

              {/* Daily Revenue Chart */}
              {revenue.dailyRevenue.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue.dailyRevenue.map((d) => ({
                      ...d,
                      dateLabel: format(new Date(d.date), 'dd/MM', { locale }),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateLabel" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Payment Method Breakdown */}
              {revenue.paymentMethodBreakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('invoices.paymentBreakdown')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {revenue.paymentMethodBreakdown.map((pm) => (
                      <div key={pm.method} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{paymentMethodLabel(pm.method)}</span>
                          <Badge variant="secondary" className="text-xs">{pm.count}</Badge>
                        </div>
                        <span className="font-bold text-sm">{formatCurrency(pm.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">{t('dashboard.upcomingAppointments')}</CardTitle>
            <CardDescription>{t('appointments.upcoming')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
            {t('common.view')} <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !upcomingAppointments || upcomingAppointments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('appointments.noAppointments')}</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {apt.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{format(new Date(apt.scheduledDate), 'dd/MM/yyyy', { locale })}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(apt.scheduledDate), 'HH:mm')} - {apt.doctorName}</p>
                    </div>
                    <Badge className={getStatusBadgeClass(apt.status)}>
                      {t(`appointments.${AppointmentStatus[apt.status]?.toLowerCase() ?? 'scheduled'}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
