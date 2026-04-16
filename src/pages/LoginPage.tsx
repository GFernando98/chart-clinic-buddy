import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { authService, PublicTenant } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import loginBg from '@/assets/login-bg.jpg';

export default function LoginPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState<PublicTenant[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    authService.getPublicTenants()
      .then((data) => {
        setClinics(data);
        if (data.length === 1) setTenantId(data[0].id);
      })
      .catch(() => setError('No se pudieron cargar las clínicas'))
      .finally(() => setLoadingClinics(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userName.trim() || !password || !tenantId) {
      setError(t('validation.required'));
      return;
    }

    const success = await login(userName.trim(), password, tenantId);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-9 h-9 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">SmileOS</CardTitle>
              <CardDescription className="mt-2">{t('auth.loginSubtitle')}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic">Seleccionar clínica</Label>
                <Select value={tenantId} onValueChange={setTenantId} disabled={loadingClinics || isLoading}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={loadingClinics ? 'Cargando clínicas...' : 'Seleccione una clínica'} />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Nombre de usuario</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="ej: gmendoza"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading || !tenantId}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.login')
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <Link to="/forgot-password" className="text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/70 drop-shadow-sm">
          © {new Date().getFullYear()} SmileOS · Distribuido por{' '}
          <span className="font-medium text-white/90">SysCore</span>
        </p>
      </div>
    </div>
  );
}
