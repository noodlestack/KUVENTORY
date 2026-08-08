import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { RoleName } from "@/utils/rbac";
import { useQueryClient } from "@tanstack/react-query";

// ============================================================
// TYPES
// ============================================================
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
  inactivityTimeout: boolean;
  logout: (reason?: "manual" | "inactivity" | "session_expired") => Promise<void>;
}

// ============================================================
// CONSTANTS
// ============================================================
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
const ACTIVITY_THROTTLE_MS = 60 * 1000; // Only update timer once per minute max
const BROADCAST_CHANNEL = "kuventory_auth_sync";
const LAST_ACTIVITY_KEY = "kuventory_last_activity";

// ============================================================
// CONTEXT
// ============================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inactivityTimeout, setInactivityTimeout] = useState<boolean>(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastActivityRef = useRef<number>(0);
  const queryClient = useQueryClient();

  // ============================================================
  // CLEAR ALL STATE
  // ============================================================
  const clearAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setIsAuthenticated(false);

    // Clear all cached query data to prevent data leaking between users
    queryClient.clear();
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }, [queryClient]);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(
    async (reason: "manual" | "inactivity" | "session_expired" = "manual") => {
      try {
        // Clear the idle timer first
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }

        // Mark inactivity timeout if applicable
        if (reason === "inactivity") {
          setInactivityTimeout(true);
        }

        // Notify other tabs BEFORE signing out
        try {
          channelRef.current?.postMessage({ type: "LOGOUT", reason });
        } catch {
          // BroadcastChannel may be unavailable in some contexts
        }

        // Sign out from Supabase
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      } finally {
        clearAuthState();
      }
    },
    [clearAuthState]
  );

  // ============================================================
  // IDLE TIMER
  // ============================================================
  const scheduleIdleCheck = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? 0);
      const lastActivity = Math.max(lastActivityRef.current, stored);

      if (now - lastActivity >= IDLE_TIMEOUT_MS) {
        logout("inactivity");
      } else {
        // Reschedule for the remaining duration
        const remaining = IDLE_TIMEOUT_MS - (now - lastActivity);
        idleTimerRef.current = setTimeout(() => logout("inactivity"), remaining);
      }
    }, IDLE_TIMEOUT_MS);
  }, [logout]);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Throttle: only update if more than 1 minute has passed since last update
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch {
      // Storage may be unavailable
    }
  }, []);

  // ============================================================
  // LOAD PROFILE AND ROLES
  // ============================================================
  const loadProfileAndRoles = useCallback(
    async (authUser: User): Promise<boolean> => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, auth_user_id, full_name, phone, avatar_url, is_active")
          .eq("auth_user_id", authUser.id)
          .single();

        if (profileError) {
          console.error("Profile query error:", profileError);
          // If the profile doesn't exist yet (trigger may not have fired), don't hard-fail
          if (profileError.code === "PGRST116") {
            // No rows returned
            console.warn("Profile not yet created for user:", authUser.id);
            return true; // Auth is still valid, profile just isn't ready
          }
          throw profileError;
        }

        if (!profileData) {
          console.warn("No profile data returned for user:", authUser.id);
          return true;
        }

        setProfile(profileData as Profile);

        // Fetch roles via join
        const { data: userRolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("roles(name)")
          .eq("profile_id", profileData.id);

        if (rolesError) {
          console.error("Roles query error:", rolesError);
          // Roles failure is non-fatal - user can still be authenticated
          return true;
        }

        const roleNames = (userRolesData ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ur: any) => ur.roles?.name as RoleName)
          .filter(Boolean);

        setRoles(roleNames);
        return true;
      } catch (error) {
        console.error("Error loading profile and roles:", error);
        // Don't throw - auth was successful, profile loading is secondary
        return false;
      }
    },
    []
  );

  // ============================================================
  // AUTH INITIALIZATION
  // ============================================================
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Use getSession() which reads from local storage synchronously
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session initialization error:", error);
        }

        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAuthenticated(true);
            await loadProfileAndRoles(currentSession.user);
            // Initialize last activity from storage or now
            const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? 0);
            lastActivityRef.current = stored || Date.now();
            scheduleIdleCheck();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setIsAuthenticated(true);
          setInactivityTimeout(false);
          lastActivityRef.current = Date.now();
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
          await loadProfileAndRoles(newSession.user);
          scheduleIdleCheck();
        } else if (event === "TOKEN_REFRESHED" && newSession?.user) {
          setSession(newSession);
          recordActivity();
        } else if (event === "SIGNED_OUT") {
          clearAuthState();
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
        } else if (event === "USER_UPDATED" && newSession?.user) {
          setUser(newSession.user);
        }

        // Always update loading state after first auth event
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [clearAuthState, loadProfileAndRoles, scheduleIdleCheck, recordActivity]);

  // ============================================================
  // BROADCAST CHANNEL (multi-tab sync)
  // ============================================================
  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "LOGOUT") {
          clearAuthState();
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
          if (event.data?.reason === "inactivity") {
            setInactivityTimeout(true);
          }
        }
      };

      channelRef.current.addEventListener("message", handleMessage);

      return () => {
        channelRef.current?.removeEventListener("message", handleMessage);
        channelRef.current?.close();
        channelRef.current = null;
      };
    } catch {
      // BroadcastChannel not available (private browsing, etc.)
    }
  }, [clearAuthState]);

  // ============================================================
  // ACTIVITY TRACKING (throttled, only when authenticated)
  // ============================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ["mousedown", "keydown", "touchstart", "pointerdown"] as const;

    const handleActivity = () => recordActivity();

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [isAuthenticated, recordActivity]);

  // ============================================================
  // DERIVED STATE
  // ============================================================
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
        inactivityTimeout,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
