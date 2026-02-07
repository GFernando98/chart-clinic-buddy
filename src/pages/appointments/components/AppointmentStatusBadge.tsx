import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { labelKey: string; className: string }> = {
  [AppointmentStatus.Scheduled]: {
    labelKey: 'appointments.statusScheduled',
    className: 'badge-scheduled',
  },
  [AppointmentStatus.Confirmed]: {
    labelKey: 'appointments.statusConfirmed',
    className: 'badge-confirmed',
  },
  [AppointmentStatus.InProgress]: {
    labelKey: 'appointments.statusInProgress',
    className: 'badge-inprogress',
  },
  [AppointmentStatus.Completed]: {
    labelKey: 'appointments.statusCompleted',
    className: 'badge-completed',
  },
  [AppointmentStatus.Cancelled]: {
    labelKey: 'appointments.statusCancelled',
    className: 'badge-cancelled',
  },
  [AppointmentStatus.NoShow]: {
    labelKey: 'appointments.statusNoShow',
    className: 'badge-noshow',
  },
};

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {t(config.labelKey)}
    </Badge>
  );
}
