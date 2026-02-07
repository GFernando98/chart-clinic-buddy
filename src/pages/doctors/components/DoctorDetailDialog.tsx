import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doctor } from '@/types';
import { mockUsers } from '@/mocks/data';
import {
  Stethoscope,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  XCircle,
  User,
} from 'lucide-react';

interface DoctorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  onEdit: (doctor: Doctor) => void;
  onToggleActive: (doctor: Doctor) => void;
}

export const DoctorDetailDialog = ({
  open,
  onOpenChange,
  doctor,
  onEdit,
  onToggleActive,
}: DoctorDetailDialogProps) => {
  const { t } = useTranslation();

  if (!doctor) return null;

  // Find linked user if any
  const linkedUser = doctor.userId
    ? mockUsers.find((u) => u.id === doctor.userId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('doctors.doctorDetails')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{doctor.fullName}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
            {doctor.isActive !== false ? (
              <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t('common.active')}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                {t('common.inactive')}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('doctors.licenseNumber')}:</span>
              <span className="font-medium">{doctor.licenseNumber}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('common.phone')}:</span>
              <span className="font-medium">{doctor.phone}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('common.email')}:</span>
              <span className="font-medium">{doctor.email}</span>
            </div>

            {linkedUser && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('doctors.linkedUser')}:</span>
                <span className="font-medium">{linkedUser.fullName}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant={doctor.isActive !== false ? 'destructive' : 'default'}
            onClick={() => onToggleActive(doctor)}
            className="w-full sm:w-auto"
          >
            {doctor.isActive !== false ? t('users.deactivate') : t('users.activate')}
          </Button>
          <Button onClick={() => onEdit(doctor)} className="w-full sm:w-auto">
            {t('common.edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
