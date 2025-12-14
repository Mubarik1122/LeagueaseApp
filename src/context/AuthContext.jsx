import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth"; // adjust path if needed

const initialValue = {
  user: null,
  loading: true,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  login: async () => {}, // placeholder async functions
  logout: () => {},
  signup: async () => {},
};

const AuthContext = createContext(initialValue);

export const AuthProvider = ({ children }) => {
  const auth = useAuth(); // your custom hook handles logic

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
