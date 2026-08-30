// Tracks whether someone is logged in, app-wide. Backed by localStorage
// so a refresh doesn't log the user out.
import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest, registerRequest } from "./api";

const AuthContext = createContext(null);
const KEY = "taskline_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const save = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
    setUser(data);
    return data;
  };

  const login = async (email, password) => save((await loginRequest(email, password)).data);
  const register = async (name, email, password) => save((await registerRequest(name, email, password)).data);
  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
