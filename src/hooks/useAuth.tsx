import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email from env
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "ogwujude872@gmail.com").toLowerCase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = useCallback(async (userId: string, email?: string | null): Promise<boolean> => {
    if (email?.toLowerCase() === ADMIN_EMAIL) return true;

    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.warn("Failed to check admin role:", error.message);
        return email?.toLowerCase() === ADMIN_EMAIL;
      }

      return roles?.some(r => r.role === "admin") ?? false;
    } catch (err) {
      console.warn("Admin role check failed:", err);
      return email?.toLowerCase() === ADMIN_EMAIL;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Safety timeout — guarantees loading becomes false even if everything fails
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth loading safety timeout triggered after 5s");
        setLoading(false);
      }
    }, 5000);

    // 1. Set up the auth state listener FIRST (this is what processes OAuth hash fragments)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        // Synchronously update session/user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase deadlock on async calls inside onAuthStateChange
          setTimeout(async () => {
            if (!mounted) return;
            const admin = await checkAdminRole(currentSession.user.id, currentSession.user.email);
            if (mounted) setIsAdmin(admin);
          }, 0);
        } else {
          setIsAdmin(false);
        }

        if (mounted) setLoading(false);
      }
    );

    // 2. Then check for an existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;

      // Only update if we don't already have a session from the listener
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);

        const admin = await checkAdminRole(existingSession.user.id, existingSession.user.email);
        if (mounted) setIsAdmin(admin);
      }

      if (mounted) setLoading(false);
    }).catch((err) => {
      console.warn("Failed to get session:", err);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear React state immediately so UI updates instantly
    setSession(null);
    setUser(null);
    setIsAdmin(false);

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
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
