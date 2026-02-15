import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "ogwujude872@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = useCallback(async (userId: string, email?: string | null): Promise<boolean> => {
    // Safety net: hardcoded admin email always passes
    if (email?.toLowerCase() === ADMIN_EMAIL) {
      return true;
    }

    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.warn("Failed to check admin role:", error.message);
        // Fallback: if DB check fails but email matches, still grant admin
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

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth loading safety timeout triggered");
        setLoading(false);
      }
    }, 8000);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const admin = await checkAdminRole(session.user.id, session.user.email);
          if (mounted) setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }

        if (mounted) setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const admin = await checkAdminRole(session.user.id, session.user.email);
        if (mounted) setIsAdmin(admin);
      }

      if (mounted) setLoading(false);
    }).catch((err) => {
      console.warn("Failed to get session:", err);
      if (mounted) setLoading(false);
    });

    // Periodically re-verify admin role every 30 minutes so it never "forgets"
    const adminRefreshInterval = setInterval(async () => {
      if (!mounted) return;
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        const admin = await checkAdminRole(currentSession.user.id, currentSession.user.email);
        if (mounted) setIsAdmin(admin);
      }
    }, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      clearInterval(adminRefreshInterval);
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
    await supabase.auth.signOut();
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
