import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("frulex_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (correo, password) => {
    const { data } = await api.post("/auth/login", { correo, password });
    localStorage.setItem("frulex_token", data.access_token);
    localStorage.setItem("frulex_user", JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem("frulex_token");
    localStorage.removeItem("frulex_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
