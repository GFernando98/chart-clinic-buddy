import { AppointmentStatus } from '@/types';

const stringToStatusMap: Record<string, AppointmentStatus> = {
  Scheduled: AppointmentStatus.Scheduled,
  Confirmed: AppointmentStatus.Confirmed,
  InProgress: AppointmentStatus.InProgress,
  Completed: AppointmentStatus.Completed,
  Cancelled: AppointmentStatus.Cancelled,
  NoShow: AppointmentStatus.NoShow,
};

export function normalizeAppointmentStatus(status: AppointmentStatus | string | number | null | undefined): AppointmentStatus {
  if (typeof status === 'number' && AppointmentStatus[status]) {
    return status as AppointmentStatus;
  }

  if (typeof status === 'string') {
    const normalized = stringToStatusMap[status];
    if (normalized) {
      return normalized;
    }

    const numericStatus = Number(status);
    if (!Number.isNaN(numericStatus) && AppointmentStatus[numericStatus]) {
      return numericStatus as AppointmentStatus;
    }
  }

  return AppointmentStatus.Scheduled;
}
