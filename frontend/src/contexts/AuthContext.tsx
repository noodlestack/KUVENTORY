import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { RoleName } from "@/utils/rbac";
import { tokenStorage } from "@/utils/tokenStorage";

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: RoleName[];
  primaryRole: RoleName | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setIsAuthenticated(false);
    tokenStorage.clearTokens(); // Keep local storage sync if needed for legacy reasons, though Supabase handles its own
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      clearAuthState();
      
      // Clear any active timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      // Notify other tabs
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'LOGOUT' });
      }
    }
  }, [clearAuthState]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        logout();
      }
    }, IDLE_TIMEOUT_MS);
  }, [isAuthenticated, logout]);

  // Load Profile and Roles
  const loadProfileAndRoles = async (authUser: User) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();
        
      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      setProfile(profileData as Profile);

      // Fetch roles
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('profile_id', profileData.id);

      if (rolesError) throw rolesError;

      const roleNames = userRolesData.map((ur: any) => ur.roles.name as RoleName);
      setRoles(roleNames);

    } catch (error) {
      console.error("Error loading profile and roles:", error);
      // Depending on policy, we might want to log out if profile loading fails
      // For now, we'll let them have an authenticated session with no roles
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const currentSession = await authService.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsAuthenticated(!!currentSession);
          if (currentSession?.user) {
            await loadProfileAndRoles(currentSession.user);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession);

        if (newSession?.user) {
          if (event === 'SIGNED_IN') {
            await loadProfileAndRoles(newSession.user);
            resetIdleTimer();
          } else if (event === 'TOKEN_REFRESHED') {
            resetIdleTimer();
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [clearAuthState, resetIdleTimer]);

  // Set up BroadcastChannel and Idle listeners
  useEffect(() => {
    channelRef.current = new BroadcastChannel('kuventory_auth_sync');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOGOUT' && isAuthenticated) {
        clearAuthState();
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
  }, [isAuthenticated, resetIdleTimer, clearAuthState]);

  const primaryRole = roles.length > 0 ? roles[0] : null;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        roles, 
        primaryRole,
        session,
        isAuthenticated, 
        isLoading, 
        logout 
      }}
    >
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
