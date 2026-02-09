import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye } from 'lucide-react';
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
import { usePagination } from '@/hooks/usePagination';
import { TablePagination, MobilePagination } from '@/components/ui/table-pagination';

interface AppointmentListViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export function AppointmentListView({
  appointments,
  onSelectAppointment,
}: AppointmentListViewProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  // Sort by date descending
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }, [appointments]);

  // Pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({ items: sortedAppointments });

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
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            {paginatedItems.map((appointment) => (
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
          </div>
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>
    );
  }

  // Desktop Table View
  return (
    <Card>
      <CardContent className="p-0">
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
            {paginatedItems.map((appointment) => (
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
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </CardContent>
    </Card>
  );
}
