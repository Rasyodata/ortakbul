'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearTokens, getToken, getRefreshToken, setTokens } from './api';

export interface WomanBenefits {
  isWoman: boolean; program: boolean;
  accountingFree: boolean; accountingFreeUntil?: string; accountingDaysLeft: number;
  consultancyFree: boolean; consultancyFreeUntil?: string; consultancyDaysLeft: number;
  auditDiscountPct: number; auditDiscountUntil?: string;
}
export interface User {
  id: string; email: string; fullName: string; memberType: string; status: string; gender?: string;
  emailVerified: boolean; phoneVerified: boolean; countryCode: string; roles: string[]; isConsultant: boolean;
  createdAt?: string; benefits?: WomanBenefits;
}

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (dto: any) => Promise<{ pendingApproval?: boolean }>;
  social: (provider: string, email: string, fullName?: string) => Promise<void>;
  logout: (allDevices?: boolean) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refreshMe = async () => {
    if (!getToken()) { setUser(null); return; }
    try {
      const me = await api.get<User>('/auth/me');
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    refreshMe().finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    const r = await api.post('/auth/login', { email, password });
    setTokens(r.accessToken, r.refreshToken, remember);
    setUser(r.user);
  };

  const register = async (dto: any) => {
    const r = await api.post('/auth/register', dto);
    setTokens(r.accessToken, r.refreshToken);
    setUser(r.user);
    return { pendingApproval: r.pendingApproval };
  };

  const social = async (provider: string, email: string, fullName?: string) => {
    const r = await api.post('/auth/social', { provider, token: `demo_${Date.now()}`, email, fullName });
    setTokens(r.accessToken, r.refreshToken);
    setUser(r.user);
  };

  // Güvenli çıkış — refresh token'ı sunucuda iptal eder, ardından tüm depolamayı temizler.
  const logout = async (allDevices = false) => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try { await api.post('/auth/logout', { refreshToken, allDevices }); } catch { /* yoksay */ }
    }
    clearTokens();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, ready, login, register, social, logout, refreshMe }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
