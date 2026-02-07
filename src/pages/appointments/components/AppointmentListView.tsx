import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Appointment } from '@/types';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppointmentListViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

const ITEMS_PER_PAGE = 10;

export function AppointmentListView({
  appointments,
  onSelectAppointment,
}: AppointmentListViewProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);

  // Sort by date descending
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = sortedAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: i18n.language === 'es' ? es : undefined });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  };

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('appointments.noAppointments')}</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-4">
        {paginatedAppointments.map((appointment) => (
          <Card
            key={appointment.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onSelectAppointment(appointment)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                </div>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{formatDate(appointment.scheduledDate)} • {formatTime(appointment.scheduledDate)}</p>
                <p className="mt-1">{appointment.reason}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.date')} / {t('common.time')}</TableHead>
              <TableHead>{t('appointments.patient')}</TableHead>
              <TableHead>{t('appointments.doctor')}</TableHead>
              <TableHead>{t('appointments.reason')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatDate(appointment.scheduledDate)}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(appointment.scheduledDate)}</p>
                  </div>
                </TableCell>
                <TableCell>{appointment.patientName}</TableCell>
                <TableCell>{appointment.doctorName}</TableCell>
                <TableCell className="max-w-[200px] truncate">{appointment.reason}</TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={appointment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectAppointment(appointment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('common.showing')} {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedAppointments.length)} {t('common.of')} {sortedAppointments.length} {t('common.results')}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('appointments.previousWeek')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t('appointments.nextWeek')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
