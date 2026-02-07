import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('errors.forbidden')}</h1>
        <p className="text-muted-foreground mb-6">
          No tiene permisos para acceder a esta página.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
