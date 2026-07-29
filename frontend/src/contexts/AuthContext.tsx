/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any active timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Notify other tabs
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'LOGOUT' });
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        logout();
        // Redirect will happen via ProtectedRoute or manual logic depending on flow.
      }
    }, IDLE_TIMEOUT_MS);
  }, [isAuthenticated, logout]);

  const login = useCallback((userData: User, accessToken: string, refreshToken?: string) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    setUser(userData);
    setIsAuthenticated(true);
    resetIdleTimer();
  }, [resetIdleTimer]);

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

  // Set up BroadcastChannel and Idle listeners
  useEffect(() => {
    channelRef.current = new BroadcastChannel('kuventory_auth_sync');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOGOUT' && isAuthenticated) {
        tokenStorage.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    
    channelRef.current.addEventListener('message', handleMessage);

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (isAuthenticated) {
        resetIdleTimer();
      }
    };

    if (isAuthenticated) {
      resetIdleTimer();
      activityEvents.forEach(evt => window.addEventListener(evt, handleActivity));
    }

    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
    };
  }, [isAuthenticated, resetIdleTimer]);

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
