import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('tiara_token');
    if (!t) {
      setLoading(false);
      return;
    }
    api
      .get('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('tiara_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('tiara_token', d.token);
    setUser(d.user);
    return d.user;
  }

  async function register(username, email, password) {
    const d = await api.post('/api/auth/register', { username, email, password });
    localStorage.setItem('tiara_token', d.token);
    setUser(d.user);
    return d.user;
  }

  function logout() {
    localStorage.removeItem('tiara_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
