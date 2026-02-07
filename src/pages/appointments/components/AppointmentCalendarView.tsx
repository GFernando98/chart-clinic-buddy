import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date, time: string) => void;
}

const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Scheduled]: 'bg-[hsl(var(--status-scheduled))]',
  [AppointmentStatus.Confirmed]: 'bg-[hsl(var(--status-confirmed))]',
  [AppointmentStatus.InProgress]: 'bg-[hsl(var(--status-inprogress))]',
  [AppointmentStatus.Completed]: 'bg-[hsl(var(--status-completed))]',
  [AppointmentStatus.Cancelled]: 'bg-[hsl(var(--status-cancelled))]',
  [AppointmentStatus.NoShow]: 'bg-[hsl(var(--status-noshow))]',
};

export function AppointmentCalendarView({
  appointments,
  currentWeek,
  onWeekChange,
  onSelectAppointment,
  onSlotClick,
}: AppointmentCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const locale = i18n.language === 'es' ? es : undefined;

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // On mobile, show only 3 days centered on today
  const visibleDays = useMemo(() => {
    if (isMobile) {
      const todayIndex = daysOfWeek.findIndex(d => isToday(d));
      const startIdx = Math.max(0, Math.min(todayIndex - 1, daysOfWeek.length - 3));
      return daysOfWeek.slice(startIdx, startIdx + 3);
    }
    return daysOfWeek;
  }, [daysOfWeek, isMobile]);

  const getAppointmentsForSlot = (day: Date, time: string) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDate);
      const aptTime = format(aptDate, 'HH:mm');
      return isSameDay(aptDate, day) && aptTime === time;
    });
  };

  const getAppointmentDuration = (apt: Appointment): number => {
    if (!apt.scheduledEndDate) return 1;
    const start = new Date(apt.scheduledDate);
    const end = new Date(apt.scheduledEndDate);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(1, Math.ceil(durationMinutes / 30));
  };

  const handlePrevWeek = () => onWeekChange(subWeeks(currentWeek, 1));
  const handleNextWeek = () => onWeekChange(addWeeks(currentWeek, 1));
  const handleToday = () => onWeekChange(new Date());

  // Mobile: Daily Agenda View
  if (isMobile) {
    const todayAppointments = appointments
      .filter((apt) => isSameDay(new Date(apt.scheduledDate), currentWeek))
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    return (
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium text-center">
              {format(currentWeek, 'EEEE, d MMMM', { locale })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              <Calendar className="h-4 w-4 mr-1" />
              {t('appointments.goToToday')}
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day.toISOString()}
              variant={isSameDay(day, currentWeek) ? 'default' : 'outline'}
              size="sm"
              className="min-w-[60px] flex-shrink-0"
              onClick={() => onWeekChange(day)}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs">{format(day, 'EEE', { locale })}</span>
                <span className={cn('text-lg font-bold', isToday(day) && 'text-primary')}>
                  {format(day, 'd')}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-2">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>{t('appointments.noAppointmentsToday')}</p>
                <p className="text-sm mt-1">{t('appointments.clickToCreate')}</p>
              </CardContent>
            </Card>
          ) : (
            todayAppointments.map((apt) => (
              <Card
                key={apt.id}
                className={cn(
                  'cursor-pointer transition-all hover:scale-[1.02]',
                  statusColors[apt.status],
                  'text-white'
                )}
                onClick={() => onSelectAppointment(apt)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {format(new Date(apt.scheduledDate), 'HH:mm')}
                    </span>
                    <span className="text-sm opacity-90">{apt.doctorName}</span>
                  </div>
                  <p className="font-semibold mt-1">{apt.patientName}</p>
                  <p className="text-sm opacity-90 truncate">{apt.reason}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create New Button */}
        <Button
          className="w-full"
          onClick={() => onSlotClick(currentWeek, '09:00')}
        >
          {t('appointments.newAppointment')}
        </Button>
      </div>
    );
  }

  // Desktop: Weekly Grid View
  return (
    <div className="space-y-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleToday}>
            {t('appointments.goToToday')}
          </Button>
        </div>
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'd', { locale })} - {format(weekEnd, 'd MMMM yyyy', { locale })}
        </h3>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="w-full">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
            <div className="p-2" />
            {visibleDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 text-center border-l',
                  isToday(day) && 'bg-primary/10'
                )}
              >
                <p className="text-sm text-muted-foreground">
                  {format(day, 'EEE', { locale })}
                </p>
                <p className={cn('text-lg font-bold', isToday(day) && 'text-primary')}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="relative">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] border-b h-12">
                <div className="p-1 text-xs text-muted-foreground text-right pr-2 border-r">
                  {time}
                </div>
                {visibleDays.map((day) => {
                  const slotAppointments = getAppointmentsForSlot(day, time);

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={cn(
                        'border-l relative cursor-pointer hover:bg-accent/30 transition-colors',
                        isToday(day) && 'bg-primary/5'
                      )}
                      onClick={() => {
                        if (slotAppointments.length === 0) {
                          onSlotClick(day, time);
                        }
                      }}
                    >
                      {slotAppointments.map((apt) => {
                        const duration = getAppointmentDuration(apt);
                        return (
                          <Tooltip key={apt.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'absolute inset-x-1 rounded px-1 py-0.5 text-xs text-white cursor-pointer overflow-hidden z-10',
                                  statusColors[apt.status]
                                )}
                                style={{
                                  height: `calc(${duration * 48}px - 4px)`,
                                  top: '2px',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectAppointment(apt);
                                }}
                              >
                                <p className="font-medium truncate">{apt.patientName}</p>
                                <p className="truncate opacity-90">{apt.reason}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="text-sm">
                                <p className="font-medium">{apt.patientName}</p>
                                <p>{apt.doctorName}</p>
                                <p className="text-muted-foreground">{apt.reason}</p>
                                <p className="text-muted-foreground">
                                  {format(new Date(apt.scheduledDate), 'HH:mm')} - 
                                  {apt.scheduledEndDate && format(new Date(apt.scheduledEndDate), 'HH:mm')}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
