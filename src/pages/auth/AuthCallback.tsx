import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // If the user is already detected by the global auth provider, redirect
        if (user) {
            navigate("/dashboard");
            return;
        }

        // Also set up a specific listener for this page to catch the event immediately
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                navigate("/dashboard");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Verifying your secure login...</p>
        </div>
    );
}
