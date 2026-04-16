import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService, PublicTenant } from '@/services/authService';
import loginBg from '@/assets/login-bg.jpg';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [clinics, setClinics] = useState<PublicTenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authService.getPublicTenants().then((data) => {
      setClinics(data);
      if (data.length === 1) {
        setTenantId(data[0].id);
      }
    }).catch(() => {});
  }, []);

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
      // Always show success to not reveal if user exists
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nombre de usuario o correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle className="w-12 h-12 text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Si el usuario está registrado, recibirás las instrucciones para restablecer tu contraseña.
              </p>
              <Link to="/login">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full h-11" disabled={isLoading || !tenantId || !userNameOrEmail.trim()}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" />Enviar instrucciones</>
                )}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  <ArrowLeft className="inline mr-1 h-3 w-3" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
