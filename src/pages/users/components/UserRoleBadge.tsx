import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/types';

interface UserRoleBadgeProps {
  role: UserRole;
}

const roleStyles: Record<UserRole, string> = {
  Admin: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Doctor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  Receptionist: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  Assistant: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  const { t } = useTranslation();

  const roleLabels: Record<UserRole, string> = {
    Admin: t('roles.admin'),
    Doctor: t('roles.doctor'),
    Receptionist: t('roles.receptionist'),
    Assistant: t('roles.assistant'),
  };

  return (
    <Badge variant="outline" className={roleStyles[role]}>
      {roleLabels[role]}
    </Badge>
  );
};
