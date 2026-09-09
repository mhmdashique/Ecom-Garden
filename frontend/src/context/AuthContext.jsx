import { createContext, useContext, useState, useCallback } from "react";
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
  const login = useCallback((t, u) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);
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
