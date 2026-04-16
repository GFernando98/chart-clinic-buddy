import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { authService, PublicTenant } from '@/services/authService';

interface ForgotPasswordDialogProps {
  clinics: PublicTenant[];
  selectedTenantId?: string;
}

export default function ForgotPasswordDialog({ clinics, selectedTenantId }: ForgotPasswordDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [tenantId, setTenantId] = useState(selectedTenantId || (clinics.length === 1 ? clinics[0]?.id : '') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userNameOrEmail.trim() || !tenantId) {
      setError('Todos los campos son requeridos');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(userNameOrEmail.trim(), tenantId);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setTenantId(selectedTenantId || (clinics.length === 1 ? clinics[0]?.id : '') || '');
    }
    if (!value) {
      setUserNameOrEmail('');
      setError('');
      setSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-primary hover:underline cursor-pointer">
          {t('auth.forgotPassword')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu nombre de usuario o correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-center text-sm text-muted-foreground">
              Si el usuario está registrado, recibirás las instrucciones para restablecer tu contraseña.
            </p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {clinics.length > 1 && (
              <div className="space-y-2">
                <Label>Clínica</Label>
                <Select value={tenantId} onValueChange={setTenantId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccione una clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resetUserNameOrEmail">Usuario o correo electrónico</Label>
              <Input
                id="resetUserNameOrEmail"
                type="text"
                placeholder="Ingrese usuario o correo electrónico"
                value={userNameOrEmail}
                onChange={(e) => setUserNameOrEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="h-11"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || !tenantId}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" />Enviar instrucciones</>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
