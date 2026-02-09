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
import { Treatment } from '@/types';
import { TreatmentCategoryBadge } from './TreatmentCategoryBadge';
import {
  FileText,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Hash,
  Globe,
  Crosshair,
} from 'lucide-react';

interface TreatmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: Treatment | null;
  onEdit: (treatment: Treatment) => void;
  onToggleActive: (treatment: Treatment) => void;
}

export const TreatmentDetailDialog = ({
  open,
  onOpenChange,
  treatment,
  onEdit,
  onToggleActive,
}: TreatmentDetailDialogProps) => {
  const { t } = useTranslation();

  if (!treatment) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('treatments.treatmentDetails')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Treatment Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{treatment.name}</h3>
              <TreatmentCategoryBadge category={treatment.category} />
            </div>
          </div>

          {/* Status and Type */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
              {treatment.isActive !== false ? (
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('treatments.selectTreatmentType')}:</span>
              {treatment.isGlobalTreatment ? (
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  {t('treatments.globalBadge')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <Crosshair className="h-3 w-3 mr-1" />
                  {t('treatments.perToothBadge')}
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('treatments.code')}:</span>
              <span className="font-medium font-mono">{treatment.code}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('treatments.defaultPrice')}:</span>
              <span className="font-medium">{formatPrice(treatment.defaultPrice)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('treatments.estimatedDuration')}:</span>
              <span className="font-medium">{treatment.estimatedDurationMinutes} {t('appointments.minutes')}</span>
            </div>

            {treatment.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">{t('common.description')}:</p>
                <p className="text-sm">{treatment.description}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant={treatment.isActive !== false ? 'destructive' : 'default'}
            onClick={() => onToggleActive(treatment)}
            className="w-full sm:w-auto"
          >
            {treatment.isActive !== false ? t('users.deactivate') : t('users.activate')}
          </Button>
          <Button onClick={() => onEdit(treatment)} className="w-full sm:w-auto">
            {t('common.edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
