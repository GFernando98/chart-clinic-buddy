import { Badge } from '@/components/ui/badge';
import { TreatmentCategory } from '@/types';
import { useTranslation } from 'react-i18next';

interface TreatmentCategoryBadgeProps {
  category: TreatmentCategory;
}

const categoryStyles: Record<TreatmentCategory, string> = {
  [TreatmentCategory.Preventive]: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  [TreatmentCategory.Restorative]: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  [TreatmentCategory.Endodontics]: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  [TreatmentCategory.Periodontics]: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
  [TreatmentCategory.Orthodontics]: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/30',
  [TreatmentCategory.Prosthodontics]: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  [TreatmentCategory.OralSurgery]: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  [TreatmentCategory.Pediatric]: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  [TreatmentCategory.Cosmetic]: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
  [TreatmentCategory.Diagnostic]: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
};

export const TreatmentCategoryBadge = ({ category }: TreatmentCategoryBadgeProps) => {
  const { t } = useTranslation();

  const categoryLabels: Record<TreatmentCategory, string> = {
    [TreatmentCategory.Preventive]: t('treatments.preventive'),
    [TreatmentCategory.Restorative]: t('treatments.restorative'),
    [TreatmentCategory.Endodontics]: t('treatments.endodontics'),
    [TreatmentCategory.Periodontics]: t('treatments.periodontics'),
    [TreatmentCategory.Orthodontics]: t('treatments.orthodontics'),
    [TreatmentCategory.Prosthodontics]: t('treatments.prosthodontics'),
    [TreatmentCategory.OralSurgery]: t('treatments.oralSurgery'),
    [TreatmentCategory.Pediatric]: t('treatments.pediatric'),
    [TreatmentCategory.Cosmetic]: t('treatments.cosmetic'),
    [TreatmentCategory.Diagnostic]: t('treatments.diagnostic'),
  };

  return (
    <Badge variant="outline" className={categoryStyles[category]}>
      {categoryLabels[category]}
    </Badge>
  );
};
