import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAccessToken } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  memberType: string;
  status: string;
  countryCode: string;
  isConsultant: boolean;
}

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dto: any) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as any);
const KEY = 'ortakbul_access';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(KEY);
        if (token) {
          setAccessToken(token);
          const me = await api.get<User>('/auth/me');
          setUser(me);
        }
      } catch {
        setAccessToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = async (r: any) => {
    setAccessToken(r.accessToken);
    await SecureStore.setItemAsync(KEY, r.accessToken);
    setUser(r.user);
  };

  const login = async (email: string, password: string) => {
    await persist(await api.post('/auth/login', { email, password }));
  };
  const register = async (dto: any) => {
    await persist(await api.post('/auth/register', dto));
  };
  const logout = async () => {
    setAccessToken(null);
    await SecureStore.deleteItemAsync(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
