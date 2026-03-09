import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import {
  CalendarDays, Clock, User, FileText, CheckCircle2, RefreshCw, XCircle,
  AlertTriangle, Loader2, Phone, ShieldCheck, CalendarClock, Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  appointmentConfirmationService,
  type AppointmentConfirmationData,
} from '@/services/appointmentConfirmationService';

const fireConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

type ModalType = 'confirm' | 'reschedule' | 'reject' | null;

export default function AppointmentConfirmationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [actionCompleted, setActionCompleted] = useState<'confirmed' | 'rejected' | 'rescheduled' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState('09:00');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointment-confirmation', token],
    queryFn: () => appointmentConfirmationService.validate(token),
    enabled: !!token,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: () => appointmentConfirmationService.confirm({ token }),
    onSuccess: () => {
      setActiveModal(null);
      setActionCompleted('confirmed');
      fireConfetti();
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => appointmentConfirmationService.reject({ token, reason: rejectReason || undefined }),
    onSuccess: () => {
      setActiveModal(null);
      setActionCompleted('rejected');
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!rescheduleDate) throw new Error('Seleccione una fecha');
      const [h, m] = rescheduleTime.split(':');
      const dt = new Date(rescheduleDate);
      dt.setHours(Number(h), Number(m), 0, 0);
      return appointmentConfirmationService.requestReschedule({
        token,
        preferredDate: dt.toISOString(),
        notes: rescheduleNotes || undefined,
      });
    },
    onSuccess: () => {
      setActiveModal(null);
      setActionCompleted('rescheduled');
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  // No token
  if (!token) {
    return <PageShell><ErrorCard message="No se proporcionó un token de confirmación." /></PageShell>;
  }

  // Loading
  if (isLoading) {
    return (
      <PageShell>
        <Card className="w-full max-w-md text-center p-10 animate-pulse">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Validando su cita…</p>
        </Card>
      </PageShell>
    );
  }

  // Error / invalid token
  if (isError || !data) {
    const msg = (error as Error)?.message || 'Este enlace no es válido o ha expirado.';
    return <PageShell><ErrorCard message={msg} phone={data?.clinicPhone} /></PageShell>;
  }

  // Already actioned
  if (data.status === 'Confirmed') {
    return <PageShell><StatusCard icon={<ShieldCheck className="h-12 w-12 text-success" />} title="Cita ya confirmada" message="Esta cita ya fue confirmada anteriormente." /></PageShell>;
  }
  if (data.status === 'Rejected') {
    return <PageShell><StatusCard icon={<Ban className="h-12 w-12 text-destructive" />} title="Cita cancelada" message="Esta cita ya fue cancelada anteriormente." /></PageShell>;
  }
  if (data.status === 'RescheduleRequested') {
    return <PageShell><StatusCard icon={<CalendarClock className="h-12 w-12 text-warning" />} title="Reprogramación solicitada" message="Ya se solicitó una reprogramación para esta cita. La clínica se contactará con usted." /></PageShell>;
  }

  // Action completed in this session
  if (actionCompleted === 'confirmed') {
    return <PageShell><StatusCard icon={<CheckCircle2 className="h-14 w-14 text-success" />} title="¡Cita Confirmada!" message={`Su cita del ${data.appointmentDate} ha sido confirmada exitosamente. ¡Lo esperamos!`} /></PageShell>;
  }
  if (actionCompleted === 'rejected') {
    return <PageShell><StatusCard icon={<XCircle className="h-14 w-14 text-destructive" />} title="Cita Cancelada" message="Su cita ha sido cancelada. Si necesita una nueva cita, por favor contacte a la clínica." phone={data.clinicPhone} /></PageShell>;
  }
  if (actionCompleted === 'rescheduled') {
    return <PageShell><StatusCard icon={<CalendarClock className="h-14 w-14 text-warning" />} title="Solicitud Enviada" message="Su solicitud de reprogramación ha sido enviada. La clínica se contactará con usted para confirmar la nueva fecha." phone={data.clinicPhone} /></PageShell>;
  }

  return (
    <PageShell clinicName={data.clinicName} clinicLogo={data.clinicLogo}>
      <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-foreground">Confirmar Cita</CardTitle>
          <p className="text-muted-foreground">Hola <span className="font-semibold text-foreground">{data.patientName}</span>, revise los detalles de su cita:</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Appointment details */}
          <div className="rounded-lg bg-secondary/60 p-4 space-y-3">
            <DetailRow icon={<CalendarDays className="h-5 w-5 text-primary" />} label="Fecha" value={data.appointmentDate} />
            <DetailRow icon={<Clock className="h-5 w-5 text-primary" />} label="Hora" value={data.appointmentTime} />
            <DetailRow icon={<User className="h-5 w-5 text-primary" />} label="Doctor" value={data.doctorName} />
            {data.reason && <DetailRow icon={<FileText className="h-5 w-5 text-primary" />} label="Motivo" value={data.reason} />}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full h-12 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground" onClick={() => setActiveModal('confirm')}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Cita
            </Button>
            <Button variant="outline" className="w-full h-11 border-warning text-warning hover:bg-warning/10 font-semibold" onClick={() => setActiveModal('reschedule')}>
              <RefreshCw className="mr-2 h-5 w-5" /> Solicitar Reprogramación
            </Button>
            <Button variant="outline" className="w-full h-11 border-destructive text-destructive hover:bg-destructive/10 font-semibold" onClick={() => setActiveModal('reject')}>
              <XCircle className="mr-2 h-5 w-5" /> No Puedo Asistir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Modal */}
      <Dialog open={activeModal === 'confirm'} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Cita</DialogTitle>
            <DialogDescription>¿Está seguro que desea confirmar su cita para el {data.appointmentDate} a las {data.appointmentTime}?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={activeModal === 'reschedule'} onOpenChange={(o) => { if (!o) { setActiveModal(null); setRescheduleDate(undefined); setRescheduleNotes(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Solicitar Reprogramación</DialogTitle>
            <DialogDescription>Seleccione su fecha y hora preferida. La clínica confirmará la disponibilidad.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Fecha preferida</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !rescheduleDate && 'text-muted-foreground')}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, "PPP", { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Hora preferida</label>
              <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Notas (opcional)</label>
              <Textarea placeholder="Alguna preferencia o comentario…" value={rescheduleNotes} onChange={(e) => setRescheduleNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button className="bg-warning hover:bg-warning/90 text-warning-foreground" onClick={() => rescheduleMutation.mutate()} disabled={rescheduleMutation.isPending || !rescheduleDate}>
              {rescheduleMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={activeModal === 'reject'} onOpenChange={(o) => { if (!o) { setActiveModal(null); setRejectReason(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>¿Está seguro que no podrá asistir a su cita?</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Motivo (opcional)</label>
            <Textarea placeholder="Si lo desea, indique el motivo…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Volver</Button></DialogClose>
            <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

/* ── Sub-components ── */

function PageShell({ children, clinicName, clinicLogo }: { children: React.ReactNode; clinicName?: string; clinicLogo?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col items-center justify-center px-4 py-8">
      {/* Clinic branding */}
      <div className="flex items-center gap-3 mb-6">
        {clinicLogo && <img src={clinicLogo} alt={clinicName || 'Clínica'} className="h-12 w-12 rounded-full object-cover shadow" />}
        {clinicName && <h1 className="text-2xl font-bold text-foreground">{clinicName}</h1>}
      </div>
      {children}
      <p className="mt-8 text-xs text-muted-foreground">Powered by SysCore</p>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ErrorCard({ message, phone }: { message: string; phone?: string }) {
  return (
    <Card className="w-full max-w-md text-center p-8 space-y-4">
      <AlertTriangle className="mx-auto h-14 w-14 text-warning" />
      <h2 className="text-lg font-semibold text-foreground">Enlace no válido</h2>
      <p className="text-muted-foreground">{message}</p>
      {phone && (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <Phone className="h-4 w-4" /> {phone}
        </a>
      )}
    </Card>
  );
}

function StatusCard({ icon, title, message, phone }: { icon: React.ReactNode; title: string; message: string; phone?: string }) {
  return (
    <Card className="w-full max-w-md text-center p-8 space-y-4">
      <div className="flex justify-center">{icon}</div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{message}</p>
      {phone && (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <Phone className="h-4 w-4" /> {phone}
        </a>
      )}
    </Card>
  );
}
