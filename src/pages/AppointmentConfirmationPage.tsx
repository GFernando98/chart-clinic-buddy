import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import {
  CalendarDays, Clock, CheckCircle2, RefreshCw,
  AlertTriangle, Loader2, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  appointmentConfirmationService,
  type TimeSlot,
} from '@/services/appointmentConfirmationService';

/* ── confetti helper ── */
const fireConfetti = () => {
  const end = Date.now() + 3000;
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

type PageState = 'initial' | 'reschedule' | 'confirmed' | 'rescheduled' | 'error';

export default function AppointmentConfirmationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const doctorId = searchParams.get('doctorId') || '';
  const { toast } = useToast();

  const [pageState, setPageState] = useState<PageState>('initial');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reschedule state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  // Fetch slots when date is selected
  const slotsQuery = useQuery({
    queryKey: ['public-slots', doctorId, selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''],
    queryFn: () => appointmentConfirmationService.getSlots(doctorId, format(selectedDate!, 'yyyy-MM-dd')),
    enabled: !!doctorId && !!selectedDate && pageState === 'reschedule',
    retry: false,
  });

  const availableSlots = slotsQuery.data?.slots.filter(s => s.isAvailable) || [];

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: () => appointmentConfirmationService.confirm(token),
    onSuccess: (msg) => {
      setShowConfirmDialog(false);
      setSuccessMessage(msg || '¡Tu cita ha sido confirmada. Nos vemos pronto!');
      setPageState('confirmed');
      fireConfetti();
    },
    onError: (err: Error) => {
      setShowConfirmDialog(false);
      setErrorMessage(err.message);
      setPageState('error');
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error('Seleccione un horario');
      return appointmentConfirmationService.reschedule(token, {
        preferredDate: selectedSlot.start,
        notes: rescheduleNotes || undefined,
      });
    },
    onSuccess: (msg) => {
      setSuccessMessage(msg || 'Tu cita ha sido reprogramada. La clínica ha sido notificada.');
      setPageState('rescheduled');
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // No token
  if (!token) {
    return <PageShell><ErrorCard message="No se proporcionó un enlace válido." /></PageShell>;
  }

  // Success states
  if (pageState === 'confirmed') {
    return (
      <PageShell>
        <StatusCard
          icon={<CheckCircle2 className="h-14 w-14 text-success" />}
          title="¡Cita Confirmada!"
          message={successMessage}
        />
      </PageShell>
    );
  }

  if (pageState === 'rescheduled') {
    return (
      <PageShell>
        <StatusCard
          icon={<RefreshCw className="h-14 w-14 text-primary" />}
          title="¡Cita Reprogramada!"
          message={successMessage}
        />
      </PageShell>
    );
  }

  if (pageState === 'error') {
    return <PageShell><ErrorCard message={errorMessage} /></PageShell>;
  }

  // Reschedule view
  if (pageState === 'reschedule') {
    return (
      <PageShell>
        <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-foreground">Reprogramar Cita</CardTitle>
            <p className="text-sm text-muted-foreground">Seleccione una nueva fecha y horario disponible.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Date picker */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Slots */}
            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Horarios disponibles</label>
                {slotsQuery.isLoading && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Cargando horarios…</span>
                  </div>
                )}
                {slotsQuery.isError && (
                  <p className="text-sm text-destructive">{(slotsQuery.error as Error).message}</p>
                )}
                {slotsQuery.isSuccess && availableSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {slotsQuery.data.message || 'No hay horarios disponibles para esta fecha.'}
                  </p>
                )}
                {slotsQuery.isSuccess && availableSlots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => {
                      const startTime = slot.start.split('T')[1]?.substring(0, 5) || slot.start;
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <Button
                          key={slot.start}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'text-sm',
                            isSelected && 'ring-2 ring-primary ring-offset-2'
                          )}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {startTime}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Notas (opcional)</label>
              <Textarea
                placeholder="Alguna preferencia o comentario…"
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPageState('initial');
                  setSelectedDate(undefined);
                  setSelectedSlot(null);
                  setRescheduleNotes('');
                }}
              >
                Volver
              </Button>
              <Button
                className="flex-1"
                onClick={() => rescheduleMutation.mutate()}
                disabled={!selectedSlot || rescheduleMutation.isPending}
              >
                {rescheduleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirmar nueva fecha
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  // Initial view — two options
  return (
    <PageShell>
      <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-xl font-bold text-foreground">Gestión de Cita</CardTitle>
          <p className="text-sm text-muted-foreground">Seleccione una opción para su cita.</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button
            className="w-full h-14 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => setShowConfirmDialog(true)}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Cita
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-base font-semibold border-primary text-primary hover:bg-primary/10"
            onClick={() => setPageState('reschedule')}
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Reprogramar Cita
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Cita</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea confirmar su cita?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground"
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

/* ── Sub-components ── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col items-center justify-center px-4 py-8">
      {children}
      <p className="mt-8 text-xs text-muted-foreground">Powered by SysCore</p>
    </div>
  );
}

function ErrorCard({ message, phone }: { message: string; phone?: string }) {
  return (
    <Card className="w-full max-w-md text-center p-8 space-y-4">
      <AlertTriangle className="mx-auto h-14 w-14 text-warning" />
      <h2 className="text-lg font-semibold text-foreground">Algo salió mal</h2>
      <p className="text-muted-foreground">{message}</p>
      {phone && (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <Phone className="h-4 w-4" /> {phone}
        </a>
      )}
    </Card>
  );
}

function StatusCard({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <Card className="w-full max-w-md text-center p-8 space-y-4">
      <div className="flex justify-center">{icon}</div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}
