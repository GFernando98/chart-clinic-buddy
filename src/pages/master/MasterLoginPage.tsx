import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { useMasterAuth } from '@/contexts/MasterAuthContext';

export default function MasterLoginPage() {
  const { isAuthenticated, login } = useMasterAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/master/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields are required'); return; }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/master/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(222,47%,11%)]">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-sm space-y-6">
        <Card className="shadow-2xl border-0 bg-white/[0.03] backdrop-blur-xl border border-white/10">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white">Master Admin</CardTitle>
              <CardDescription className="mt-1 text-white/50">Sign in to manage all clinics</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterEmail" className="text-white/70">Email</Label>
                <Input
                  id="masterEmail"
                  type="email"
                  placeholder="admin@smileos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masterPass" className="text-white/70">Password</Label>
                <div className="relative">
                  <Input
                    id="masterPass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign in as Master Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-white/25">
          © {new Date().getFullYear()} SmileOS · <span className="font-medium">SysCore</span>
        </p>
      </div>
    </div>
  );
}
