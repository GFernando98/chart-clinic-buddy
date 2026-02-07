import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { UserInfo } from '@/types';
import { 
  authService, 
  setTokens, 
  clearTokens, 
  setOnTokenRefreshed, 
  setOnAuthError, 
  setOnActivityTracked,
  getErrorMessage 
} from '@/services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string | string[]) => boolean;
  showSessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes before timeout

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const logoutTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  const { t } = useTranslation();

  const clearTimeouts = useCallback(() => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
  }, []);

  const performLogout = useCallback(async () => {
    clearTimeouts();
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors, still clear local state
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setShowSessionWarning(false);
    clearTokens();
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
        toast({
          title: t('auth.sessionExpired'),
          variant: 'destructive',
        });
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, clearTimeouts, performLogout, toast, t]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Set up API client callbacks
  useEffect(() => {
    setOnTokenRefreshed((newAccessToken, newRefreshToken) => {
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
    });

    setOnAuthError(() => {
      performLogout();
      toast({
        title: t('auth.sessionExpired'),
        variant: 'destructive',
      });
    });

    setOnActivityTracked(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        resetInactivityTimer();
      }
    });
  }, [performLogout, toast, t, resetInactivityTimer]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) { // Throttle to 1 second
        resetInactivityTimer();
      }
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

  // Initial loading check - try to get current user if tokens exist
  useEffect(() => {
    const initAuth = async () => {
      // In a real scenario, we might have tokens from a previous session
      // For now, just mark as not loading
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.succeeded) {
        setUser(response.user);
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        
        toast({
          title: `${t('auth.welcomeBack')}, ${response.user.firstName}!`,
        });
        
        return true;
      } else {
        toast({
          title: t('auth.invalidCredentials'),
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast({
        title: t('auth.invalidCredentials'),
        description: message,
        variant: 'destructive',
      });
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
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    showSessionWarning,
    extendSession,
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
