import React, { createContext, useContext, useState, useCallback } from 'react';
import { masterService, setMasterToken, clearMasterToken, getMasterToken } from '@/services/masterService';

interface MasterAuthContextType {
  isAuthenticated: boolean;
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MasterAuthContext = createContext<MasterAuthContextType | null>(null);

export function MasterAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getMasterToken());

  const login = useCallback(async (userName: string, password: string) => {
    try {
      const response = await masterService.login({ userName, password });
      if (response.succeeded && response.data) {
        setMasterToken(response.data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearMasterToken();
    setIsAuthenticated(false);
  }, []);

  return (
    <MasterAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </MasterAuthContext.Provider>
  );
}

export function useMasterAuth() {
  const ctx = useContext(MasterAuthContext);
  if (!ctx) throw new Error('useMasterAuth must be used within MasterAuthProvider');
  return ctx;
}
