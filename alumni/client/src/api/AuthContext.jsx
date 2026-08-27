// AuthContext.jsx — Auth context for the Alumni portal
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { alumniApi } from './alumniApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('alumni_admin_token');
    const savedUser = localStorage.getItem('alumni_admin_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      alumniApi.me().then(data => setUser(data.user)).catch(() => {
        localStorage.removeItem('alumni_admin_token');
        localStorage.removeItem('alumni_admin_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await alumniApi.login(username, password);
    localStorage.setItem('alumni_admin_token', data.token);
    localStorage.setItem('alumni_admin_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('alumni_admin_token');
    localStorage.removeItem('alumni_admin_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
