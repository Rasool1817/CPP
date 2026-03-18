import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getSession, getUserAttributes, signOut as cognitoSignOut } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        await getSession();
        const attrs = await getUserAttributes();
        setUser({
          email: attrs.email,
          name: attrs.name || attrs.email,
          sub: attrs.sub,
        });
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    cognitoSignOut();
    setUser(null);
  }

  function loginSuccess(session) {
    const payload = session.getIdToken().decodePayload();
    setUser({
      email: payload.email,
      name: payload.name || payload.email,
      sub: payload.sub,
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginSuccess, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
