import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const defaultPersonalUser: User = {
  id: 'adhoundiyal20-personal',
  email: 'adhoundiyal20@gmail.com',
  displayName: 'Ashutosh',
  createdAt: '2026-01-01T00:00:00.000Z'
};

const AuthContext = createContext<AuthContextType>({
  user: defaultPersonalUser,
  loading: false,
  login: async () => {},
  register: async () => {},
  loginDemo: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultPersonalUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getMe();
        if (res?.user) {
          setUser(res.user);
        }
      } catch (e) {
        // Fallback is already defaultPersonalUser
      }
    }
    loadProfile();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: async () => {},
      register: async () => {},
      loginDemo: async () => {},
      logout: () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
