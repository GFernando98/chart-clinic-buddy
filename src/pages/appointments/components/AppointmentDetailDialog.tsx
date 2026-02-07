import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
  Edit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Appointment, AppointmentStatus } from '@/types';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit: () => void;
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus, cancellationReason?: string) => void;
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onStatusChange,
}: AppointmentDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  if (!appointment) return null;

  const scheduledDate = new Date(appointment.scheduledDate);
  const endDate = appointment.scheduledEndDate ? new Date(appointment.scheduledEndDate) : null;

  const handleConfirm = () => {
    onStatusChange(appointment.id, AppointmentStatus.Confirmed);
  };

  const handleStart = () => {
    onStatusChange(appointment.id, AppointmentStatus.InProgress);
  };

  const handleComplete = () => {
    onStatusChange(appointment.id, AppointmentStatus.Completed);
  };

  const handleCancel = () => {
    onStatusChange(appointment.id, AppointmentStatus.Cancelled, cancellationReason);
    setShowCancelDialog(false);
    setCancellationReason('');
  };

  const handleNoShow = () => {
    onStatusChange(appointment.id, AppointmentStatus.NoShow);
  };

  const canConfirm = appointment.status === AppointmentStatus.Scheduled;
  const canStart = appointment.status === AppointmentStatus.Confirmed;
  const canComplete = appointment.status === AppointmentStatus.InProgress;
  const canCancel = [AppointmentStatus.Scheduled, AppointmentStatus.Confirmed].includes(appointment.status);
  const canNoShow = [AppointmentStatus.Scheduled, AppointmentStatus.Confirmed].includes(appointment.status);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t('appointments.appointmentDetails')}</span>
              <AppointmentStatusBadge status={appointment.status} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Info */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('appointments.patient')}</p>
                <p className="font-medium">{appointment.patientName}</p>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('appointments.doctor')}</p>
                <p className="font-medium">{appointment.doctorName}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('appointments.scheduledDate')}</p>
                <p className="font-medium">
                  {format(scheduledDate, 'PPPP', { locale: i18n.language === 'es' ? es : undefined })}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('appointments.scheduledTime')}</p>
                <p className="font-medium">
                  {format(scheduledDate, 'HH:mm')}
                  {endDate && ` - ${format(endDate, 'HH:mm')}`}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{t('appointments.reason')}</p>
                <p className="font-medium">{appointment.reason}</p>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t('common.notes')}</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            )}

            {/* Cancellation Reason */}
            {appointment.status === AppointmentStatus.Cancelled && appointment.cancellationReason && (
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium mb-1">{t('appointments.cancellationReason')}</p>
                <p className="text-sm">{appointment.cancellationReason}</p>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canConfirm && (
                <Button size="sm" onClick={handleConfirm} className="gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {t('appointments.confirmAppointment')}
                </Button>
              )}

              {canStart && (
                <Button size="sm" onClick={handleStart} className="gap-1">
                  <PlayCircle className="h-4 w-4" />
                  {t('appointments.startAppointment')}
                </Button>
              )}

              {canComplete && (
                <Button size="sm" onClick={handleComplete} className="gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {t('appointments.completeAppointment')}
                </Button>
              )}

              {canNoShow && (
                <Button size="sm" variant="outline" onClick={handleNoShow} className="gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {t('appointments.noShow')}
                </Button>
              )}

              {canCancel && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  {t('appointments.cancelAppointment')}
                </Button>
              )}
            </div>

            <Separator />

            {/* Edit Button */}
            <Button variant="outline" className="w-full gap-2" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('appointments.confirmCancel')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('appointments.cancelReason')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancellationReason">{t('appointments.cancellationReason')}</Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder={t('appointments.cancelReason')}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
