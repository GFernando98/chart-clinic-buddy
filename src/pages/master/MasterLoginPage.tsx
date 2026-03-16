import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { masterService, setMasterToken } from '@/services/masterService';

export default function MasterLoginPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userName || !password) { setError('Todos los campos son requeridos'); return; }

    setIsLoading(true);
    try {
      const response = await masterService.login({ userName, password });
      if (response.succeeded && response.data) {
        setMasterToken(response.data.accessToken);
        navigate('/master/dashboard');
      } else {
        setError('Credenciales inválidas');
      }
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
      <div className="w-full max-w-sm space-y-6">
        <Card className="shadow-xl border">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-background" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Panel Master</CardTitle>
              <CardDescription className="mt-1">Acceso administrativo del sistema</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterUser">Usuario</Label>
                <Input id="masterUser" type="text" placeholder="admin" value={userName}
                  onChange={(e) => setUserName(e.target.value)} disabled={isLoading} autoFocus className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masterPass">Contraseña</Label>
                <div className="relative">
                  <Input id="masterPass" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ingresando...</> : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SmileOS · <span className="font-medium">SysCore</span>
        </p>
      </div>
    </div>
  );
}
