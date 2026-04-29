import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Plus, List, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Appointment, AppointmentStatus } from "@/types";
import { AppointmentListView } from "./components/AppointmentListView";
import { AppointmentCalendarView } from "./components/AppointmentCalendarView";
import { AppointmentFormDialog } from "./components/AppointmentFormDialog";
import { AppointmentDetailDialog } from "./components/AppointmentDetailDialog";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
} from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";

type ViewMode = "list" | "calendar";
export type CalendarMode = "week" | "month";

export default function AppointmentsPage() {
  const { t } = useTranslation();

  // ─── State ───────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("week");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    AppointmentStatus | "all"
  >("all");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();

  // ─── Rango dinámico ──────────────────────────────────────────
  // Ahora depende de calendarMode (estado del padre) para saber
  // exactamente cuántos datos pedir al navegar
  const dateRange = useMemo(() => {
    if (viewMode === "list") {
      return {
        from: startOfMonth(currentWeek).toISOString(),
        to: endOfMonth(currentWeek).toISOString(),
      };
    }

    if (calendarMode === "week") {
      return {
        from: startOfWeek(currentWeek, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(currentWeek, { weekStartsOn: 1 }).toISOString(),
      };
    }

    // Modo mes: incluye el padding de semanas que muestra el grid
    const monthStart = startOfMonth(currentWeek);
    const monthEnd = endOfMonth(currentWeek);
    return {
      from: startOfWeek(monthStart, { weekStartsOn: 1 }).toISOString(),
      to: endOfWeek(monthEnd, { weekStartsOn: 1 }).toISOString(),
    };
  }, [currentWeek, viewMode, calendarMode]);

  // ─── Data ────────────────────────────────────────────────────
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useAppointments({
      from: dateRange.from,
      to: dateRange.to,
      doctorId: selectedDoctor !== "all" ? selectedDoctor : undefined,
    });

  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const updateStatus = useUpdateAppointmentStatus();

  const isLoading = appointmentsLoading || doctorsLoading;

  const filteredAppointments = useMemo(() => {
    if (selectedStatus === "all") return appointments;
    return appointments.filter((apt) => apt.status === selectedStatus);
  }, [appointments, selectedStatus]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setFormDialogOpen(true);
  };

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedAppointment(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setFormDialogOpen(true);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    try {
      if (data.id) {
        await updateAppointment.mutateAsync({ id: data.id, data: data as any });
      } else {
        await createAppointment.mutateAsync(data as any);
      }
      setFormDialogOpen(false);
    } catch {
      // manejado por onError del mutation
    }
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: AppointmentStatus,
    cancellationReason?: string,
  ) => {
    updateStatus.mutate({
      id: appointmentId,
      status: newStatus,
      cancellationReason,
    });
    setDetailDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {t("appointments.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("appointments.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleNewAppointment}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("appointments.newAppointment")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="justify-start"
              size="sm"
            >
              <ToggleGroupItem value="calendar">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                {t("appointments.viewCalendar")}
              </ToggleGroupItem>
              <ToggleGroupItem value="list">
                <List className="h-4 w-4 mr-1.5" />
                {t("appointments.viewList")}
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex-1" />

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("appointments.allDoctors")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("appointments.allDoctors")}
                  </SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus as string}
                onValueChange={(v) =>
                  setSelectedStatus(v as AppointmentStatus | "all")
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("appointments.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("appointments.allStatuses")}
                  </SelectItem>
                  <SelectItem value="Scheduled">
                    {t("appointments.statusScheduled")}
                  </SelectItem>
                  <SelectItem value="Confirmed">
                    {t("appointments.statusConfirmed")}
                  </SelectItem>
                  <SelectItem value="InProgress">
                    {t("appointments.statusInProgress")}
                  </SelectItem>
                  <SelectItem value="Completed">
                    {t("appointments.statusCompleted")}
                  </SelectItem>
                  <SelectItem value="Cancelled">
                    {t("appointments.statusCancelled")}
                  </SelectItem>
                  <SelectItem value="NoShow">
                    {t("appointments.statusNoShow")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="pt-4 md:pt-6 px-2 sm:px-6">
          {viewMode === "calendar" ? (
            <AppointmentCalendarView
              appointments={filteredAppointments}
              currentWeek={currentWeek}
              calendarMode={calendarMode}
              onWeekChange={setCurrentWeek}
              onCalendarModeChange={setCalendarMode}
              onSelectAppointment={handleSelectAppointment}
              onSlotClick={handleSlotClick}
            />
          ) : (
            <AppointmentListView
              appointments={filteredAppointments}
              onSelectAppointment={handleSelectAppointment}
            />
          )}
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        appointment={selectedAppointment}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        onSave={handleSaveAppointment}
        isSaving={createAppointment.isPending || updateAppointment.isPending}
      />

      <AppointmentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        appointment={selectedAppointment}
        onEdit={() => {
          setDetailDialogOpen(false);
          setFormDialogOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
