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
import { User } from '@/types';
import { UserRoleBadge } from './UserRoleBadge';
import { Mail, User as UserIcon, Shield, CheckCircle2, XCircle } from 'lucide-react';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export const UserDetailDialog = ({
  open,
  onOpenChange,
  user,
  onEdit,
  onToggleActive,
}: UserDetailDialogProps) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.userDetails')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
            {user.isActive !== false ? (
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

          {/* Roles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              {t('users.roles')}:
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <UserRoleBadge key={role} role={role} />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant={user.isActive !== false ? 'destructive' : 'default'}
            onClick={() => onToggleActive(user)}
            className="w-full sm:w-auto"
          >
            {user.isActive !== false ? t('users.deactivate') : t('users.activate')}
          </Button>
          <Button onClick={() => onEdit(user)} className="w-full sm:w-auto">
            {t('common.edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
