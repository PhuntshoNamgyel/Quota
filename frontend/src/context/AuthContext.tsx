// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/client';

type Role = 'lecturer' | 'student';
interface User { id: number; name: string; email: string; role: Role; }

interface AuthState {
  user: User | null;
  loading: boolean;    // a login request is in flight
  restoring: boolean;  // checking storage for a saved session at launch
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'quota_token';
const USER_KEY = 'quota_user';

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  // On launch, restore a saved session so the user stays logged in across app restarts.
  useEffect(() => {
    (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && savedUser) {
          setAuthToken(token);          // make the JWT available to the api client
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // ignore restore errors — the user can just log in again
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setAuthToken(data.token);
      setUser(data.user);
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user)),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setAuthToken(null);
    setUser(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }

  return (
    <AuthContext.Provider value={{ user, loading, restoring, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}