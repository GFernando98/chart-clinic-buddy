import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Eye, EyeOff, ArrowLeft, Building2, ChevronRight } from 'lucide-react';
import { ClinicOption } from '@/types';
import loginBg from '@/assets/login-bg.jpg';

type LoginStep = 'username' | 'select-clinic' | 'password';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('username');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicOption | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  const { login, lookupUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userName.trim()) {
      setError('Ingresa tu nombre de usuario');
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await lookupUser(userName.trim());
      if (!result || result.length === 0) {
        setError('Usuario no encontrado');
        return;
      }
      setClinics(result);
      if (result.length === 1) {
        setSelectedClinic(result[0]);
        setStep('password');
      } else {
        setStep('select-clinic');
      }
    } catch {
      setError('Usuario no encontrado');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSelectClinic = (clinic: ClinicOption) => {
    setSelectedClinic(clinic);
    setStep('password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError(t('validation.required'));
      return;
    }
    if (!selectedClinic) return;

    const success = await login(userName, password, selectedClinic.tenantId);
    if (success) {
      navigate('/');
    }
  };

  const handleBack = () => {
    setError('');
    setPassword('');
    if (step === 'password' && clinics.length > 1) {
      setStep('select-clinic');
    } else {
      setStep('username');
      setClinics([]);
      setSelectedClinic(null);
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
              <CardDescription className="mt-2">
                {step === 'username' && t('auth.loginSubtitle')}
                {step === 'select-clinic' && 'Selecciona la clínica a la que deseas acceder'}
                {step === 'password' && selectedClinic && (
                  <span className="flex items-center justify-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {selectedClinic.name}
                  </span>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Step 1: Username */}
            {step === 'username' && (
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Nombre de usuario</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="ej: gmendoza"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={isLookingUp}
                    autoComplete="username"
                    autoFocus
                    className="h-11"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLookingUp}>
                  {isLookingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Select Clinic */}
            {step === 'select-clinic' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {clinics.map((clinic) => (
                    <button
                      key={clinic.tenantId}
                      onClick={() => handleSelectClinic(clinic)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{clinic.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{clinic.slug}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>

                <Button variant="ghost" className="w-full" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <span className="text-muted-foreground">Usuario:</span>
                  <span className="font-medium">{userName}</span>
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
                      autoFocus
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

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('auth.login')
                  )}
                </Button>

                <Button variant="ghost" className="w-full" onClick={handleBack} type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </form>
            )}
            
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>{t('auth.forgotPassword')}</p>
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
