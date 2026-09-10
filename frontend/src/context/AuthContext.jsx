import { createContext, useContext, useState, useCallback } from "react";
import { useCart } from "./CartContext.jsx";
import api from "../api.js";

const Ctx = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const { cart, syncToBackend, loadFromBackend } = useCart();

  const login = useCallback(async (t, u) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    try {
      await loadFromBackend();
    } catch (e) {
      console.warn("Cart sync from backend failed:", e.message);
    }
  }, [loadFromBackend]);

  const logout = useCallback(() => {
    if (user?.id && cart.length > 0) {
      syncToBackend().catch((e) =>
        console.warn("Cart sync before logout failed:", e.message),
      );
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, [user?.id, cart.length, syncToBackend]);

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: ["admin", "super-admin"].includes(user?.role),
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
export const useAuth = () => useContext(Ctx);
