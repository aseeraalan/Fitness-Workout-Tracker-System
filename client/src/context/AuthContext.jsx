import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, client = api }) {
  const [user, setUser] = useState(null);
  const [authConfig, setAuthConfig] = useState({ googleEnabled: false });
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState('');

  const refresh = useCallback(async () => {
    const me = await client.getMe();
    setUser(me.user);
    return me.user;
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await client.loadCsrf();
        const config = await client.getConfig();
        if (!cancelled) setAuthConfig(config);
        try {
          const me = await client.getMe();
          if (!cancelled) setUser(me.user);
        } catch {
          if (!cancelled) setUser(null);
        }
      } catch (error) {
        if (!cancelled) setBootError(error.message || 'Unable to reach the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      bootError,
      authConfig,
      refresh,
      async register(input) {
        const data = await client.register(input);
        setUser(data.user);
        return data.user;
      },
      async login(input) {
        const data = await client.login(input);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await client.logout();
        setUser(null);
      },
      async saveProfile(input) {
        const data = await client.updateProfile(input);
        setUser(data.user);
        return data.user;
      },
      googleStartUrl: client.googleStartUrl(),
    }),
    [user, loading, bootError, authConfig, refresh, client]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
