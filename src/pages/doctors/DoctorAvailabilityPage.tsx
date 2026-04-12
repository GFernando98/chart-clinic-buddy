import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Plus, Trash2, CalendarOff, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useDoctor } from '@/hooks/useDoctors';
import {
  useDoctorAvailability,
  useSetAvailability,
  useAddException,
  useRemoveException,
} from '@/hooks/useDoctorAvailability';
import { DayOfWeek, DoctorAvailability, DoctorException } from '@/types';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'Monday', label: 'Lunes' },
  { key: 'Tuesday', label: 'Martes' },
  { key: 'Wednesday', label: 'Miércoles' },
  { key: 'Thursday', label: 'Jueves' },
  { key: 'Friday', label: 'Viernes' },
  { key: 'Saturday', label: 'Sábado' },
  { key: 'Sunday', label: 'Domingo' },
];

const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60];

interface DayState {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

const defaultDayState: DayState = {
  isAvailable: false,
  startTime: '08:00',
  endTime: '17:00',
  slotDurationMinutes: 30,
};

export default function DoctorAvailabilityPage() {
  const { id: doctorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doctor, isLoading: loadingDoctor } = useDoctor(doctorId!);
  const { data: availabilityData = [], isLoading: loadingAvailability } = useDoctorAvailability(doctorId!);
  const setAvailability = useSetAvailability();
  const addException = useAddException();
  const removeException = useRemoveException(doctorId!);

  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [exceptionDate, setExceptionDate] = useState<Date>();
  const [isFullDayOff, setIsFullDayOff] = useState(true);
  const [exStartTime, setExStartTime] = useState('08:00');
  const [exEndTime, setExEndTime] = useState('12:00');
  const [exReason, setExReason] = useState('');

  const isLoading = loadingDoctor || loadingAvailability;

  // Build state from API data
  const getDayState = (day: DayOfWeek): DayState & { exists: boolean } => {
    const existing = availabilityData.find((a) => a.dayOfWeek === day);
    if (existing) {
      return {
        exists: true,
        isAvailable: existing.isAvailable,
        startTime: existing.startTime.substring(0, 5),
        endTime: existing.endTime.substring(0, 5),
        slotDurationMinutes: existing.slotDurationMinutes,
      };
    }
    return { exists: false, ...defaultDayState };
  };

  const handleSaveDay = (day: DayOfWeek, state: DayState) => {
    setAvailability.mutate({
      doctorId: doctorId!,
      data: {
        dayOfWeek: day,
        startTime: state.startTime + ':00',
        endTime: state.endTime + ':00',
        isAvailable: state.isAvailable,
        slotDurationMinutes: state.slotDurationMinutes,
      },
    });
  };

  const handleAddException = () => {
    if (!exceptionDate) return;
    addException.mutate(
      {
        doctorId: doctorId!,
        data: {
          exceptionDate: format(exceptionDate, 'yyyy-MM-dd'),
          isFullDayOff,
          ...(isFullDayOff ? {} : { startTime: exStartTime + ':00', endTime: exEndTime + ':00' }),
          reason: exReason || undefined,
        },
      },
      {
        onSuccess: () => {
          setExceptionDialogOpen(false);
          setExceptionDate(undefined);
          setIsFullDayOff(true);
          setExStartTime('08:00');
          setExEndTime('12:00');
          setExReason('');
        },
      }
    );
  };

  // We don't have a separate exceptions endpoint yet - they might come from the availability response
  // For now we'll filter items that look like exceptions (none in current API, we'll need a separate GET)
  // The backend spec doesn't have a GET exceptions endpoint, so we'll track them via the add/remove flow

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Disponibilidad — {doctor?.fullName}
          </h1>
          <p className="text-muted-foreground">{doctor?.specialty}</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horario Semanal
          </CardTitle>
          <CardDescription>
            Configura los días y horarios de atención del doctor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map(({ key, label }) => (
            <DayRow
              key={key}
              label={label}
              dayOfWeek={key}
              initial={getDayState(key)}
              onSave={(state) => handleSaveDay(key, state)}
              isSaving={setAvailability.isPending}
            />
          ))}
        </CardContent>
      </Card>

      {/* Exceptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarOff className="h-5 w-5" />
                Excepciones / Días Bloqueados
              </CardTitle>
              <CardDescription>
                Vacaciones, permisos o días con horario especial
              </CardDescription>
            </div>
            <Button onClick={() => setExceptionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar excepción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las excepciones agregadas se aplican automáticamente al validar citas. 
            Usa el botón para bloquear un día o definir un horario especial.
          </p>
        </CardContent>
      </Card>

      {/* Exception Dialog */}
      <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Excepción</DialogTitle>
            <DialogDescription>
              Bloquea un día completo o define un horario especial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !exceptionDate && 'text-muted-foreground')}
                  >
                    {exceptionDate ? format(exceptionDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exceptionDate}
                    onSelect={setExceptionDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <Label>Día completo</Label>
              <Switch checked={isFullDayOff} onCheckedChange={setIsFullDayOff} />
            </div>

            {!isFullDayOff && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora inicio</Label>
                  <Input type="time" value={exStartTime} onChange={(e) => setExStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hora fin</Label>
                  <Input type="time" value={exEndTime} onChange={(e) => setExEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Textarea
                placeholder="Ej: Vacaciones, congreso médico..."
                value={exReason}
                onChange={(e) => setExReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExceptionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddException} disabled={!exceptionDate || addException.isPending}>
              {addException.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Day Row Component ----

function DayRow({
  label,
  dayOfWeek,
  initial,
  onSave,
  isSaving,
}: {
  label: string;
  dayOfWeek: DayOfWeek;
  initial: DayState & { exists: boolean };
  onSave: (state: DayState) => void;
  isSaving: boolean;
}) {
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [slotDuration, setSlotDuration] = useState(initial.slotDurationMinutes);
  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    onSave({ isAvailable, startTime, endTime, slotDurationMinutes: slotDuration });
    setDirty(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3 min-w-[140px]">
        <Switch
          checked={isAvailable}
          onCheckedChange={(v) => {
            setIsAvailable(v);
            markDirty();
          }}
        />
        <span className="font-medium text-sm">{label}</span>
      </div>

      {isAvailable ? (
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Inicio</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); markDirty(); }}
              className="w-[130px] h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Fin</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); markDirty(); }}
              className="w-[130px] h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Duración</Label>
            <Select
              value={String(slotDuration)}
              onValueChange={(v) => { setSlotDuration(Number(v)); markDirty(); }}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOT_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Guardar
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <Badge variant="secondary" className="text-xs">No disponible</Badge>
          {dirty && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Guardar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
