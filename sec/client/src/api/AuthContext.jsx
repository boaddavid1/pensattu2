// AuthContext.jsx — Authentication context for the SEC module
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { secApi } from './secApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sec_admin_token');
    const savedUser = localStorage.getItem('sec_admin_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await secApi.login({ email, password });
    if (data.success) {
      localStorage.setItem('sec_admin_token', data.token);
      localStorage.setItem('sec_admin_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    return secApi.register({ username, email, password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sec_admin_token');
    localStorage.removeItem('sec_admin_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
