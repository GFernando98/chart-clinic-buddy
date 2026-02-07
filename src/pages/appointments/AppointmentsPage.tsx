import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, List, CalendarDays } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Appointment, AppointmentStatus } from '@/types';
import { mockAppointments, mockDoctors } from '@/mocks/data';
import { AppointmentListView } from './components/AppointmentListView';
import { AppointmentCalendarView } from './components/AppointmentCalendarView';
import { AppointmentFormDialog } from './components/AppointmentFormDialog';
import { AppointmentDetailDialog } from './components/AppointmentDetailDialog';

type ViewMode = 'list' | 'calendar';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
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

  const handleSaveAppointment = (data: Partial<Appointment>) => {
    if (data.id) {
      // Update existing
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === data.id ? { ...apt, ...data } : apt
        )
      );
      toast({
        title: t('appointments.appointmentUpdated'),
        description: data.patientName,
      });
    } else {
      // Create new
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: data.patientId!,
        patientName: data.patientName!,
        doctorId: data.doctorId!,
        doctorName: data.doctorName!,
        scheduledDate: data.scheduledDate!,
        scheduledEndDate: data.scheduledEndDate,
        status: AppointmentStatus.Scheduled,
        reason: data.reason!,
        notes: data.notes,
        reminderSent: false,
      };
      setAppointments((prev) => [...prev, newAppointment]);
      toast({
        title: t('appointments.appointmentCreated'),
        description: data.patientName,
      });
    }
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: AppointmentStatus,
    cancellationReason?: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus, cancellationReason }
          : apt
      )
    );
    setDetailDialogOpen(false);
    toast({
      title: t('appointments.statusChanged'),
      description: t(`appointments.status${newStatus}`),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('appointments.title')}</h1>
          <p className="text-muted-foreground">{t('appointments.subtitle')}</p>
        </div>
        <Button onClick={handleNewAppointment} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('appointments.newAppointment')}
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* View Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="justify-start"
            >
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <CalendarDays className="h-4 w-4 mr-2" />
                {t('appointments.viewCalendar')}
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4 mr-2" />
                {t('appointments.viewList')}
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex-1" />

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('appointments.allDoctors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('appointments.allDoctors')}</SelectItem>
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus as string} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
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
        <CardContent className="pt-6">
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
