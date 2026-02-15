import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, List, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Appointment, AppointmentStatus } from '@/types';
import { AppointmentListView } from './components/AppointmentListView';
import { AppointmentCalendarView } from './components/AppointmentCalendarView';
import { AppointmentFormDialog } from './components/AppointmentFormDialog';
import { AppointmentDetailDialog } from './components/AppointmentDetailDialog';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';

type ViewMode = 'list' | 'calendar';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();

  // Fetch data from API
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const updateStatus = useUpdateAppointmentStatus();

  const isLoading = appointmentsLoading || doctorsLoading;

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const doctorMatch = selectedDoctor === 'all' || apt.doctorId === selectedDoctor;
      const statusMatch = selectedStatus === 'all' || apt.status === (selectedStatus as AppointmentStatus);
      return doctorMatch && statusMatch;
    });
  }, [appointments, selectedDoctor, selectedStatus]);

  // Handlers
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

  const handleEditAppointment = () => {
    setDetailDialogOpen(false);
    setFormDialogOpen(true);
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
      // Error is handled by the mutation's onError callback
    }
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: AppointmentStatus,
    cancellationReason?: string
  ) => {
    updateStatus.mutate({ id: appointmentId, status: newStatus, cancellationReason });
    setDetailDialogOpen(false);
  };

  // Loading state
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
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{t('appointments.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('appointments.subtitle')}</p>
        </div>
        <Button onClick={handleNewAppointment} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {t('appointments.newAppointment')}
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* View Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="justify-start"
              size="sm"
            >
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                {t('appointments.viewCalendar')}
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4 mr-1.5" />
                {t('appointments.viewList')}
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex-1" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('appointments.allDoctors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('appointments.allDoctors')}</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus as string} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('appointments.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('appointments.allStatuses')}</SelectItem>
                  <SelectItem value="Scheduled">
                    {t('appointments.statusScheduled')}
                  </SelectItem>
                  <SelectItem value="Confirmed">
                    {t('appointments.statusConfirmed')}
                  </SelectItem>
                  <SelectItem value="InProgress">
                    {t('appointments.statusInProgress')}
                  </SelectItem>
                  <SelectItem value="Completed">
                    {t('appointments.statusCompleted')}
                  </SelectItem>
                  <SelectItem value="Cancelled">
                    {t('appointments.statusCancelled')}
                  </SelectItem>
                  <SelectItem value="NoShow">
                    {t('appointments.statusNoShow')}
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
          {viewMode === 'calendar' ? (
            <AppointmentCalendarView
              appointments={filteredAppointments}
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
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

      {/* Form Dialog */}
      <AppointmentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        appointment={selectedAppointment}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        onSave={handleSaveAppointment}
        isSaving={createAppointment.isPending || updateAppointment.isPending}
      />

      {/* Detail Dialog */}
      <AppointmentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
