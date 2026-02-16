import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  status: "active" | "suspended";
  can_chat: boolean;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("status, can_chat, full_name")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Error fetching profile:", error);
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
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

    // 1. Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        // Synchronously update session/user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (!mounted) return;
            const userId = currentSession.user.id;
            const email = currentSession.user.email;

            const [admin, userProfile] = await Promise.all([
              checkAdminRole(userId, email),
              fetchProfile(userId)
            ]);

            if (mounted) {
              setIsAdmin(admin);
              setProfile(userProfile);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setProfile(null);
        }

        if (mounted) setLoading(false);
      }
    );

    // 2. Then check for an existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (!mounted) return;

      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);

        const userId = existingSession.user.id;
        const email = existingSession.user.email;

        const [admin, userProfile] = await Promise.all([
          checkAdminRole(userId, email),
          fetchProfile(userId)
        ]);

        if (mounted) {
          setIsAdmin(admin);
          setProfile(userProfile);
        }
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
  }, [checkAdminRole, fetchProfile]);

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
    setProfile(null);
    setIsAdmin(false);

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signUp, signIn, signOut }}>
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
