import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export function SessionWarningDialog() {
  const { t } = useTranslation();
  const { showSessionWarning, extendSession, logout } = useAuth();

  return (
    <AlertDialog open={showSessionWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <AlertDialogTitle>{t('auth.sessionWarning')}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {t('auth.sessionExpired')}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={logout}>
            {t('auth.logout')}
          </Button>
          <AlertDialogAction onClick={extendSession}>
            {t('auth.continueSession')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
