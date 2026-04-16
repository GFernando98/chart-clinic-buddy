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
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState(selectedTenantId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !tenantId) {
      setError('Todos los campos son requeridos');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim(), tenantId);
      setSent(true);
    } catch {
      // Always show success to not reveal if email exists
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setEmail('');
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
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-center text-sm text-muted-foreground">
              Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.
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
              <Label htmlFor="resetEmail">Correo electrónico</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="ej: usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
