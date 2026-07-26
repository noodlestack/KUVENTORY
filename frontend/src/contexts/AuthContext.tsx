import React, { createContext, useContext, useState, useEffect } from "react";
import { tokenStorage } from "@/utils/tokenStorage";

export type Role = "Admin" | "Cashier" | "Manager" | null;

interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load check
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      if (tokenStorage.isAuthenticated()) {
        // Placeholder: When backend is ready, this would decode the JWT or fetch /me
        // For now, we stub an authenticated user if a token exists
        setUser({
          id: "1",
          email: "admin@kapeuno.com",
          username: "admin",
          role: "Admin",
        });
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken?: string) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
