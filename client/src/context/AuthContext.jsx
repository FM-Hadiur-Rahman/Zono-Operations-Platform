import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, getToken, getUser, saveAuth } from "../utils/storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setAuthReady(true);
  }, []);

  const login = ({ token, user }) => {
    saveAuth({ token, user });
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authReady,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user, authReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
