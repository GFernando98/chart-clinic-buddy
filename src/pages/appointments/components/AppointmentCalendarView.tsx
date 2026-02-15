import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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

type CalendarMode = 'week' | 'month';

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

const statusDotColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Scheduled]: 'bg-blue-500',
  [AppointmentStatus.Confirmed]: 'bg-emerald-500',
  [AppointmentStatus.InProgress]: 'bg-amber-500',
  [AppointmentStatus.Completed]: 'bg-green-600',
  [AppointmentStatus.Cancelled]: 'bg-red-500',
  [AppointmentStatus.NoShow]: 'bg-gray-500',
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
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // On mobile, show only 3 days centered on today
  const visibleDays = useMemo(() => {
    if (isMobile && calendarMode === 'week') {
      const todayIndex = daysOfWeek.findIndex(d => isToday(d));
      const startIdx = Math.max(0, Math.min(todayIndex - 1, daysOfWeek.length - 3));
      return daysOfWeek.slice(startIdx, startIdx + 3);
    }
    return daysOfWeek;
  }, [daysOfWeek, isMobile, calendarMode]);

  // Month view days
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentWeek);
    const monthEnd = endOfMonth(currentWeek);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentWeek]);

  const getAppointmentsForSlot = (day: Date, time: string) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDate);
      const aptTime = format(aptDate, 'HH:mm');
      return isSameDay(aptDate, day) && aptTime === time;
    });
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments
      .filter((apt) => isSameDay(new Date(apt.scheduledDate), day))
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const getAppointmentDuration = (apt: Appointment): number => {
    if (!apt.scheduledEndDate) return 1;
    const start = new Date(apt.scheduledDate);
    const end = new Date(apt.scheduledEndDate);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(1, Math.ceil(durationMinutes / 30));
  };

  const handlePrev = () => {
    if (calendarMode === 'month') {
      onWeekChange(subMonths(currentWeek, 1));
    } else {
      onWeekChange(subWeeks(currentWeek, 1));
    }
  };

  const handleNext = () => {
    if (calendarMode === 'month') {
      onWeekChange(addMonths(currentWeek, 1));
    } else {
      onWeekChange(addWeeks(currentWeek, 1));
    }
  };

  const handleToday = () => onWeekChange(new Date());

  const handleDayClickInMonth = (day: Date) => {
    onWeekChange(day);
    setCalendarMode('week');
  };

  // ── Navigation header (shared) ──
  const navigationTitle = calendarMode === 'month'
    ? format(currentWeek, 'MMMM yyyy', { locale })
    : `${format(weekStart, 'd', { locale })} - ${format(weekEnd, 'd MMMM yyyy', { locale })}`;

  // Mobile: Daily Agenda View
  if (isMobile) {
    const todayAppointments = getAppointmentsForDay(currentWeek);

    return (
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={calendarMode}
            onValueChange={(v) => v && setCalendarMode(v as CalendarMode)}
            size="sm"
          >
            <ToggleGroupItem value="week">
              <CalendarDays className="h-4 w-4 mr-1" />
              {t('appointments.viewWeek')}
            </ToggleGroupItem>
            <ToggleGroupItem value="month">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {t('appointments.viewMonth')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium text-center">
              {calendarMode === 'month'
                ? format(currentWeek, 'MMMM yyyy', { locale })
                : format(currentWeek, 'EEEE, d MMMM', { locale })
              }
            </span>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              <CalendarIcon className="h-4 w-4 mr-1" />
              {t('appointments.goToToday')}
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {calendarMode === 'month' ? (
          /* Mobile Month Grid */
          <MobileMonthGrid
            monthDays={monthDays}
            currentWeek={currentWeek}
            appointments={appointments}
            locale={locale}
            onDayClick={handleDayClickInMonth}
          />
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }

  // ── DESKTOP ──
  return (
    <div className="space-y-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleToday}>
            {t('appointments.goToToday')}
          </Button>
        </div>

        <h3 className="text-lg font-semibold capitalize">{navigationTitle}</h3>

        {/* Mode Toggle */}
        <ToggleGroup
          type="single"
          value={calendarMode}
          onValueChange={(v) => v && setCalendarMode(v as CalendarMode)}
          size="sm"
        >
          <ToggleGroupItem value="week">
            <CalendarDays className="h-4 w-4 mr-1" />
            {t('appointments.viewWeek')}
          </ToggleGroupItem>
          <ToggleGroupItem value="month">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {t('appointments.viewMonth')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {calendarMode === 'month' ? (
        /* ── MONTH VIEW ── */
        <DesktopMonthGrid
          monthDays={monthDays}
          currentWeek={currentWeek}
          appointments={appointments}
          locale={locale}
          onDayClick={handleDayClickInMonth}
          onSelectAppointment={onSelectAppointment}
          onSlotClick={onSlotClick}
        />
      ) : (
        /* ── WEEK VIEW ── */
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
      )}
    </div>
  );
}

// ── DESKTOP MONTH GRID ──
function DesktopMonthGrid({
  monthDays,
  currentWeek,
  appointments,
  locale,
  onDayClick,
  onSelectAppointment,
  onSlotClick,
}: {
  monthDays: Date[];
  currentWeek: Date;
  appointments: Appointment[];
  locale: any;
  onDayClick: (day: Date) => void;
  onSelectAppointment: (apt: Appointment) => void;
  onSlotClick: (date: Date, time: string) => void;
}) {
  const { t } = useTranslation();
  const weekDayHeaders = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) });
  }, []);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {weekDayHeaders.map((day) => (
          <div key={day.toISOString()} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {format(day, 'EEE', { locale })}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0" style={{ minHeight: '120px' }}>
          {week.map((day) => {
            const dayAppts = appointments
              .filter((apt) => isSameDay(new Date(apt.scheduledDate), day))
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
            const inMonth = isSameMonth(day, currentWeek);
            const maxVisible = 3;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'border-r last:border-r-0 p-1 cursor-pointer hover:bg-accent/20 transition-colors flex flex-col',
                  !inMonth && 'opacity-40 bg-muted/20',
                  isToday(day) && 'bg-primary/5'
                )}
                onClick={() => {
                  if (dayAppts.length === 0) {
                    onSlotClick(day, '09:00');
                  } else {
                    onDayClick(day);
                  }
                }}
              >
                <div className={cn(
                  'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                  isToday(day) && 'bg-primary text-primary-foreground'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayAppts.slice(0, maxVisible).map((apt) => (
                    <div
                      key={apt.id}
                      className={cn(
                        'text-xs rounded px-1.5 py-0.5 truncate cursor-pointer text-white',
                        statusColors[apt.status]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(apt);
                      }}
                    >
                      <span className="font-medium">{format(new Date(apt.scheduledDate), 'HH:mm')}</span>{' '}
                      {apt.patientName}
                    </div>
                  ))}
                  {dayAppts.length > maxVisible && (
                    <div
                      className="text-xs text-primary font-medium px-1.5 cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDayClick(day);
                      }}
                    >
                      +{dayAppts.length - maxVisible} {t('common.more')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── MOBILE MONTH GRID (compact) ──
function MobileMonthGrid({
  monthDays,
  currentWeek,
  appointments,
  locale,
  onDayClick,
}: {
  monthDays: Date[];
  currentWeek: Date;
  appointments: Appointment[];
  locale: any;
  onDayClick: (day: Date) => void;
}) {
  const weekDayHeaders = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) });
  }, []);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {weekDayHeaders.map((day) => (
          <div key={day.toISOString()} className="p-1 text-center text-xs font-medium text-muted-foreground">
            {format(day, 'EEEEE', { locale })}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
          {week.map((day) => {
            const dayAppts = appointments.filter((apt) => isSameDay(new Date(apt.scheduledDate), day));
            const inMonth = isSameMonth(day, currentWeek);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-1 text-center cursor-pointer hover:bg-accent/20 transition-colors min-h-[48px] border-r last:border-r-0',
                  !inMonth && 'opacity-30',
                  isToday(day) && 'bg-primary/10'
                )}
                onClick={() => onDayClick(day)}
              >
                <div className={cn(
                  'text-sm mx-auto w-6 h-6 flex items-center justify-center rounded-full',
                  isToday(day) && 'bg-primary text-primary-foreground font-bold'
                )}>
                  {format(day, 'd')}
                </div>
                {dayAppts.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                    {dayAppts.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className={cn('w-1.5 h-1.5 rounded-full', statusDotColors[apt.status])}
                      />
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{dayAppts.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
