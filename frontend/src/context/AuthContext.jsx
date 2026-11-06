import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function readStoredUser() {
  try {
    const token = localStorage.getItem("frulex_token");
    const decoded = decodeToken(token);
    const saved = localStorage.getItem("frulex_user");
    if (!token || !decoded) {
      localStorage.removeItem("frulex_token");
      localStorage.removeItem("frulex_user");
      return null;
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        rol: decoded.rol || parsed.rol || "cliente",
      };
    }
    return {
      id: Number(decoded.sub),
      rol: decoded.rol || "cliente",
    };
  } catch {
    localStorage.removeItem("frulex_token");
    localStorage.removeItem("frulex_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("frulex_token")));

  useEffect(() => {
    const token = localStorage.getItem("frulex_token");
    const decoded = decodeToken(token);
    if (!token || !decoded) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        const enrichedUser = {
          ...data,
          rol: decoded.rol || data.rol,
        };
        localStorage.setItem("frulex_user", JSON.stringify(enrichedUser));
        setUser(enrichedUser);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("frulex_token");
        localStorage.removeItem("frulex_user");
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("frulex:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("frulex:unauthorized", handleUnauthorized);
  }, []);

  const login = async (correo, password) => {
    const { data } = await api.post("/auth/login", { correo, password });
    const decoded = decodeToken(data.access_token);
    const usuarioFinal = {
      ...data.usuario,
      rol: decoded?.rol || data.usuario?.rol || "cliente",
    };
    localStorage.setItem("frulex_token", data.access_token);
    localStorage.setItem("frulex_user", JSON.stringify(usuarioFinal));
    setUser(usuarioFinal);
    return usuarioFinal;
  };

  const logout = () => {
    localStorage.removeItem("frulex_token");
    localStorage.removeItem("frulex_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
