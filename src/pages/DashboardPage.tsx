import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  Users,
  Clock,
  ClipboardList,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  LineChart as LineChartIcon,
  Filter,
  CheckCircle2,
  XCircle,
  UserMinus,
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useDashboardStats,
  useAppointmentsByDay,
  useTreatmentsByCategory,
  useUpcomingAppointments,
  useInventoryStats,
} from "@/hooks/useDashboard";
import { useRevenue } from "@/hooks/useInvoice";
import { useDoctors } from "@/hooks/useDoctors";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AppointmentStatus } from "@/types";

// ─── Constantes ───────────────────────────────────────────────
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Scheduled]: "badge-scheduled",
  [AppointmentStatus.Confirmed]: "badge-confirmed",
  [AppointmentStatus.InProgress]: "badge-inprogress",
  [AppointmentStatus.Completed]: "badge-completed",
  [AppointmentStatus.Cancelled]: "badge-cancelled",
  [AppointmentStatus.NoShow]: "badge-noshow",
};

const PAYMENT_METHOD_KEYS: Record<number, string> = {
  1: "invoices.paymentCash",
  2: "invoices.paymentCreditCard",
  3: "invoices.paymentDebitCard",
  4: "invoices.paymentBankTransfer",
  5: "invoices.paymentCheck",
  6: "invoices.paymentOther",
};

// ─── Helpers ─────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  `L ${n.toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;

const fmtDate = (d: Date) => format(d, "yyyy-MM-dd");

// ─── Sub-componentes ──────────────────────────────────────────
function ChartToggle({
  value,
  onChange,
}: {
  value: "bar" | "line";
  onChange: (v: "bar" | "line") => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
      <button
        onClick={() => onChange("bar")}
        className={`p-1.5 rounded-md transition-colors ${value === "bar" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        <BarChart3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("line")}
        className={`p-1.5 rounded-md transition-colors ${value === "line" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        <LineChartIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtitle?: string;
}) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold truncate">{value}</p>
            <p className="text-sm text-muted-foreground leading-tight">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <BarChart3 className="w-8 h-8 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  },
  labelStyle: { color: "hsl(var(--foreground))" },
  itemStyle: { color: "hsl(var(--foreground))" },
};

// ─── Página principal ─────────────────────────────────────────
export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const locale = i18n.language === "es" ? es : enUS;

  // ── Estado de filtros globales ────────────────────────────
  const now = new Date();
  const [globalFrom, setGlobalFrom] = useState(fmtDate(startOfMonth(now)));
  const [globalTo, setGlobalTo] = useState(fmtDate(endOfMonth(now)));
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");

  // ── Filtros independientes ────────────────────────────────
  const [revenueFrom, setRevenueFrom] = useState(fmtDate(startOfMonth(now)));
  const [revenueTo, setRevenueTo] = useState(fmtDate(endOfMonth(now)));
  const [invFrom, setInvFrom] = useState(fmtDate(startOfMonth(now)));
  const [invTo, setInvTo] = useState(fmtDate(endOfMonth(now)));

  // ── Tipos de gráfica ──────────────────────────────────────
  const [apptChartType, setApptChartType] = useState<"bar" | "line">("bar");
  const [revChartType, setRevChartType] = useState<"bar" | "line">("bar");
  const [invChartType, setInvChartType] = useState<"bar" | "line">("bar");

  const filters = useMemo(
    () => ({
      from: globalFrom,
      to: globalTo,
      doctorId: selectedDoctor !== "all" ? selectedDoctor : undefined,
    }),
    [globalFrom, globalTo, selectedDoctor],
  );

  // ── Presets de período ────────────────────────────────────
  const setPreset = (
    preset: "thisMonth" | "lastMonth" | "last30" | "last90",
  ) => {
    if (preset === "thisMonth") {
      setGlobalFrom(fmtDate(startOfMonth(now)));
      setGlobalTo(fmtDate(endOfMonth(now)));
    } else if (preset === "lastMonth") {
      const last = subMonths(now, 1);
      setGlobalFrom(fmtDate(startOfMonth(last)));
      setGlobalTo(fmtDate(endOfMonth(last)));
    } else if (preset === "last30") {
      setGlobalFrom(fmtDate(new Date(now.getTime() - 30 * 86400000)));
      setGlobalTo(fmtDate(now));
    } else {
      setGlobalFrom(fmtDate(new Date(now.getTime() - 90 * 86400000)));
      setGlobalTo(fmtDate(now));
    }
  };

  // ── Hooks de datos ────────────────────────────────────────
  const { data: doctors } = useDoctors();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats(filters);
  const { data: apptsByDay, isLoading: apptLoading } =
    useAppointmentsByDay(filters);
  const { data: treatmentsCat, isLoading: pieLoading } =
    useTreatmentsByCategory(filters);
  const { data: upcoming, isLoading: upcomingLoading } =
    useUpcomingAppointments(globalFrom, filters.doctorId, 10);
  const { data: inventoryStats, isLoading: invLoading } = useInventoryStats({
    from: invFrom,
    to: invTo,
  });
  const { data: revenue, isLoading: revLoading } = useRevenue(
    revenueFrom,
    revenueTo,
  );

  const noDataLabel = t("dashboard.noDataInPeriod");

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.welcomeBack")}, {user?.firstName}
        </p>
      </div>

      {/* ── Filtros globales ── */}
      <Card className="shadow-sm border-dashed">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  ["thisMonth", "dashboard.thisMonth"],
                  ["lastMonth", "dashboard.lastMonth"],
                  ["last30", "dashboard.last30Days"],
                  ["last90", "dashboard.last90Days"],
                ] as const
              ).map(([key, labelKey]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setPreset(key)}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>

            {/* Fechas manuales */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={globalFrom}
                onChange={(e) => setGlobalFrom(e.target.value)}
                className="h-8 w-36 text-xs"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input
                type="date"
                value={globalTo}
                onChange={(e) => setGlobalTo(e.target.value)}
                className="h-8 w-36 text-xs"
              />
            </div>

            {/* Filtro doctor */}
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue placeholder={t("appointments.allDoctors")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("appointments.allDoctors")}
                </SelectItem>
                {doctors?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── KPIs principales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : statsError ? (
          <div className="col-span-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{t("dashboard.statsError")}</span>
          </div>
        ) : stats ? (
          <>
            <StatCard
              title={t("dashboard.todayAppointments")}
              value={stats.todayAppointments}
              icon={Calendar}
              color="text-info"
              bgColor="bg-info/10"
              subtitle={t("dashboard.currentDate")}
            />
            <StatCard
              title={t("dashboard.totalPatients")}
              value={stats.totalPatients}
              icon={Users}
              color="text-accent"
              bgColor="bg-accent/10"
              subtitle={t("dashboard.newPatientsInPeriod", {
                count: stats.newPatientsInPeriod,
              })}
            />
            <StatCard
              title={t("dashboard.pendingAppointments")}
              value={stats.pendingAppointments}
              icon={Clock}
              color="text-warning"
              bgColor="bg-warning/10"
            />
            <StatCard
              title={t("dashboard.activeDoctors")}
              value={stats.activeDoctors}
              icon={Stethoscope}
              color="text-primary"
              bgColor="bg-primary/10"
            />
          </>
        ) : null}
      </div>

      {/* ── KPIs del período ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              labelKey: "dashboard.appointmentsInPeriod",
              value: stats.appointmentsInPeriod,
              icon: Calendar,
              color: "text-primary",
            },
            {
              labelKey: "dashboard.completed",
              value: stats.completedInPeriod,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              labelKey: "dashboard.cancelled",
              value: stats.cancelledInPeriod,
              icon: XCircle,
              color: "text-red-500",
            },
            {
              labelKey: "dashboard.noShow",
              value: stats.noShowInPeriod,
              icon: UserMinus,
              color: "text-orange-500",
            },
            {
              labelKey: "dashboard.monthTreatments",
              value: stats.monthTreatments,
              icon: ClipboardList,
              color: "text-info",
            },
            {
              labelKey: "dashboard.cancellationRate",
              value: `${stats.cancellationRate}%`,
              icon: AlertCircle,
              color: "text-warning",
            },
          ].map((kpi) => (
            <Card key={kpi.labelKey} className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className="text-xs text-muted-foreground leading-tight">
                    {t(kpi.labelKey)}
                  </span>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Gráficas: citas por día + tratamientos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Citas por día */}
        <Card className="shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {t("dashboard.appointmentsByDay")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.periodRange", { from: globalFrom, to: globalTo })}
              </CardDescription>
            </div>
            <ChartToggle value={apptChartType} onChange={setApptChartType} />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {apptLoading ? (
                <ChartLoading />
              ) : !apptsByDay?.length ? (
                <ChartEmpty label={noDataLabel} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {apptChartType === "bar" ? (
                    <BarChart data={apptsByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="dayLabel"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        allowDecimals={false}
                      />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar
                        dataKey="completed"
                        name={t("dashboard.completed")}
                        stackId="a"
                        fill="hsl(var(--chart-2))"
                      />
                      <Bar
                        dataKey="pending"
                        name={t("dashboard.pendingAppointments")}
                        stackId="a"
                        fill="hsl(var(--chart-3))"
                      />
                      <Bar
                        dataKey="cancelled"
                        name={t("dashboard.cancelled")}
                        stackId="a"
                        fill="hsl(var(--chart-1))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </BarChart>
                  ) : (
                    <LineChart data={apptsByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="dayLabel"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        allowDecimals={false}
                      />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name={t("common.total") ?? "Total"}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        name={t("dashboard.completed")}
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cancelled"
                        name={t("dashboard.cancelled")}
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tratamientos por categoría */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {t("dashboard.treatmentsByCategory")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.periodRange", { from: globalFrom, to: globalTo })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieLoading ? (
                <ChartLoading />
              ) : !treatmentsCat?.length ? (
                <ChartEmpty label={noDataLabel} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={treatmentsCat}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {treatmentsCat.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.color || CHART_COLORS[i % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} ${t("dashboard.treatments")} — ${fmtCurrency(props.payload.revenue)}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {treatmentsCat && treatmentsCat.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {treatmentsCat.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          entry.color || CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Ingresos ── */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> {t("invoices.revenue")}
            </CardTitle>
            <CardDescription>{t("dashboard.revenueSubtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ChartToggle value={revChartType} onChange={setRevChartType} />
            <Input
              type="date"
              value={revenueFrom}
              onChange={(e) => setRevenueFrom(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="date"
              value={revenueTo}
              onChange={(e) => setRevenueTo(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {revLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : revenue ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    labelKey: "invoices.totalInvoices",
                    value: revenue.totalInvoices,
                    color: "",
                  },
                  {
                    labelKey: "invoices.totalRevenue",
                    value: fmtCurrency(revenue.totalRevenue),
                    color: "text-primary",
                  },
                  {
                    labelKey: "invoices.totalPaid",
                    value: fmtCurrency(revenue.totalPaid),
                    color: "text-green-600 dark:text-green-400",
                  },
                  {
                    labelKey: "invoices.totalPending",
                    value: fmtCurrency(revenue.totalPending),
                    color: "text-orange-600 dark:text-orange-400",
                  },
                ].map((item) => (
                  <div
                    key={item.labelKey}
                    className="rounded-lg bg-muted/50 p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {t(item.labelKey)}
                    </p>
                    <p className={`text-xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {t("dashboard.dailyRevenue")}
                </p>
                <div className="h-56">
                  {revenue.dailyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {revChartType === "bar" ? (
                        <BarChart
                          data={revenue.dailyRevenue.map((d) => ({
                            ...d,
                            dateLabel: format(new Date(d.date), "dd/MM", {
                              locale,
                            }),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(v: number) => fmtCurrency(v)}
                          />
                          <Bar
                            dataKey="amount"
                            name={t("invoices.revenue")}
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      ) : (
                        <LineChart
                          data={revenue.dailyRevenue.map((d) => ({
                            ...d,
                            dateLabel: format(new Date(d.date), "dd/MM", {
                              locale,
                            }),
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(v: number) => fmtCurrency(v)}
                          />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            name={t("invoices.revenue")}
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty label={noDataLabel} />
                  )}
                </div>
              </div>

              {revenue.paymentMethodBreakdown.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    {t("invoices.paymentBreakdown")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {revenue.paymentMethodBreakdown.map((pm) => (
                      <div
                        key={pm.method}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {t(
                              PAYMENT_METHOD_KEYS[pm.method] ??
                                "invoices.paymentOther",
                            )}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {pm.count}
                          </Badge>
                        </div>
                        <span className="font-bold text-sm">
                          {fmtCurrency(pm.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ChartEmpty label={noDataLabel} />
          )}
        </CardContent>
      </Card>

      {/* ── Inventario ── */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> {t("dashboard.inventoryTitle")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.inventorySubtitle")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={invFrom}
              onChange={(e) => setInvFrom(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="date"
              value={invTo}
              onChange={(e) => setInvTo(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/inventory")}
            >
              {t("dashboard.viewInventory")}{" "}
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : inventoryStats ? (
            <div className="space-y-4">
              {/* KPIs inventario */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    labelKey: "dashboard.activeProducts",
                    value: inventoryStats.activeProducts,
                    icon: Package,
                    color: "text-primary",
                  },
                  {
                    labelKey: "dashboard.inventoryValue",
                    value: fmtCurrency(inventoryStats.inventoryValue),
                    icon: DollarSign,
                    color: "text-accent",
                  },
                  {
                    labelKey: "dashboard.lowStock",
                    value: inventoryStats.lowStockProducts,
                    icon: AlertTriangle,
                    color: "text-warning",
                  },
                  {
                    labelKey: "dashboard.expiringSoon",
                    value: inventoryStats.expiringSoonProducts,
                    icon: AlertCircle,
                    color: "text-destructive",
                  },
                  {
                    labelKey: "dashboard.entries",
                    value: inventoryStats.totalEntries,
                    icon: ArrowUpRight,
                    color: "text-green-600",
                  },
                  {
                    labelKey: "dashboard.exits",
                    value: inventoryStats.totalExits,
                    icon: ArrowDownRight,
                    color: "text-red-500",
                  },
                ].map((kpi) => (
                  <Card key={kpi.labelKey} className="shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                        <span className="text-xs text-muted-foreground">
                          {t(kpi.labelKey)}
                        </span>
                      </div>
                      <p className="text-lg font-bold leading-tight">
                        {kpi.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Movimientos por día */}
              {inventoryStats.movementsByDay.some(
                (d) => d.entries > 0 || d.exits > 0,
              ) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      {t("dashboard.entriesVsExits")}
                    </p>
                    <ChartToggle
                      value={invChartType}
                      onChange={setInvChartType}
                    />
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      {invChartType === "bar" ? (
                        <BarChart
                          data={inventoryStats.movementsByDay.map((d) => ({
                            ...d,
                            dateLabel: format(new Date(d.date), "dd/MM", {
                              locale,
                            }),
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                          />
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                          />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Bar
                            dataKey="entries"
                            name={t("dashboard.entries")}
                            fill="hsl(var(--chart-2))"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                          />
                          <Bar
                            dataKey="exits"
                            name={t("dashboard.exits")}
                            fill="hsl(var(--chart-1))"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                        </BarChart>
                      ) : (
                        <LineChart
                          data={inventoryStats.movementsByDay.map((d) => ({
                            ...d,
                            dateLabel: format(new Date(d.date), "dd/MM", {
                              locale,
                            }),
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                          />
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                          />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Line
                            type="monotone"
                            dataKey="entries"
                            name={t("dashboard.entries")}
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="exits"
                            name={t("dashboard.exits")}
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Top productos */}
              {inventoryStats.topSellingProducts.length > 0 && (
                <div>
                  <p className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4" />{" "}
                    {t("dashboard.topProducts")}
                  </p>
                  <div className="space-y-2">
                    {inventoryStats.topSellingProducts.map((p, i) => (
                      <div
                        key={p.productCode}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {i + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {p.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.productCode}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {p.quantitySold} {t("dashboard.units")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmtCurrency(p.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ChartEmpty label={noDataLabel} />
          )}
        </CardContent>
      </Card>

      {/* ── Próximas citas ── */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">
              {t("dashboard.upcomingAppointments")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.upcomingFrom", { from: globalFrom })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/appointments")}
          >
            {t("dashboard.viewAll")} <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !upcoming?.length ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 opacity-30" />
              <p className="text-sm">{t("dashboard.noUpcomingAppointments")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {apt.patientName
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.reason ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">
                        {format(new Date(apt.scheduledDate), "dd/MM/yyyy", {
                          locale,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.scheduledDate), "HH:mm")} ·{" "}
                        {apt.doctorName}
                      </p>
                    </div>
                    <Badge
                      className={
                        STATUS_BADGE[apt.status as AppointmentStatus] ??
                        "badge-scheduled"
                      }
                    >
                      {t(
                        `appointments.${AppointmentStatus[apt.status as AppointmentStatus]?.toLowerCase() ?? "scheduled"}`,
                      )}
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
