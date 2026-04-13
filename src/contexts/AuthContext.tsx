import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { UserInfo } from '@/types';
import { 
  authService, 
  setTokens, 
  clearTokens,
  hasValidTokens,
  setOnTokenRefreshed, 
  setOnAuthError, 
  setOnActivityTracked,
  getErrorMessage 
} from '@/services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: UserInfo | null;
  login: (userName: string, password: string, tenantId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string | string[]) => boolean;
  showSessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const logoutTimeoutRef = useRef<NodeJS.Timeout>();
  const isLoggingOutRef = useRef(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();

  const clearTimeouts = useCallback(() => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
  }, []);

  const performLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    clearTimeouts();
    clearTokens();
    setUser(null);
    setShowSessionWarning(false);
    try {
      await authService.logout();
    } catch {
      // Ignore
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [clearTimeouts]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowSessionWarning(false);
    clearTimeouts();

    if (user) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowSessionWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);

      logoutTimeoutRef.current = setTimeout(() => {
        performLogout();
        toast({ title: t('auth.sessionExpired'), variant: 'destructive' });
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, clearTimeouts, performLogout, toast, t]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    setOnTokenRefreshed(() => { resetInactivityTimer(); });
    setOnAuthError(() => {
      // Don't show session-expired on public pages (e.g. /confirmar-cita)
      const isPublicPage = window.location.pathname.startsWith('/confirmar-cita');
      if (!isPublicPage) {
        performLogout();
        toast({ title: t('auth.sessionExpired'), variant: 'destructive' });
      }
    });
    setOnActivityTracked(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) { resetInactivityTimer(); }
    });
  }, [performLogout, toast, t, resetInactivityTimer]);

  useEffect(() => {
    if (!user) return;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) { resetInactivityTimer(); }
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    resetInactivityTimer();
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimeouts();
    };
  }, [user, resetInactivityTimer, clearTimeouts]);

  useEffect(() => {
    const initAuth = async () => {
      if (hasValidTokens()) {
        try {
          const userInfo = await authService.getCurrentUser();
          setUser(userInfo);
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (userName: string, password: string, tenantId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ userName, password, tenantId });
      if (response.succeeded && response.data) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        setUser(response.data.user);
        toast({ title: `${t('auth.welcomeBack')}, ${response.data.user.firstName}!` });
        return true;
      } else {
        toast({ title: t('auth.invalidCredentials'), variant: 'destructive' });
        return false;
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast({ title: t('auth.invalidCredentials'), description: message, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  const logout = useCallback(async () => {
    await performLogout();
  }, [performLogout]);

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.roles.includes(r as any));
  }, [user]);

  const value: AuthContextType = {
    user, login, logout,
    isAuthenticated: !!user, isLoading, hasRole,
    showSessionWarning, extendSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
