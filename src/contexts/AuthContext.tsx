import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { UserInfo, LoginResponse } from '@/types';
import { mockUsers } from '@/mocks/data';
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

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowSessionWarning(false);
    clearTimeouts();

    if (user) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowSessionWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);

      logoutTimeoutRef.current = setTimeout(() => {
        logout();
        toast({
          title: t('auth.sessionExpired'),
          variant: 'destructive',
        });
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, clearTimeouts, toast, t]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

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

  // Initial loading check
  useEffect(() => {
    // In a real app, we might check for an existing session
    // For now, we just mark as not loading
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock authentication - in real app, this would call the API
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && password === 'Admin@123!') {
      const mockResponse: LoginResponse = {
        succeeded: true,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        accessTokenExpiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        user: {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          fullName: foundUser.fullName,
          roles: foundUser.roles,
        },
      };
      
      setUser(mockResponse.user);
      setAccessToken(mockResponse.accessToken);
      setRefreshToken(mockResponse.refreshToken);
      setIsLoading(false);
      
      toast({
        title: `${t('auth.welcomeBack')}, ${mockResponse.user.firstName}!`,
      });
      
      return true;
    }
    
    setIsLoading(false);
    toast({
      title: t('auth.invalidCredentials'),
      variant: 'destructive',
    });
    return false;
  }, [toast, t]);

  const logout = useCallback(async () => {
    clearTimeouts();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setShowSessionWarning(false);
  }, [clearTimeouts]);

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
