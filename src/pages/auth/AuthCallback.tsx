import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * AuthCallback — handles the OAuth redirect from Google.
 *
 * Flow:
 * 1. Google redirects here with a hash fragment (#access_token=...).
 * 2. Supabase JS client automatically detects the hash and exchanges it for a session.
 * 3. The onAuthStateChange listener fires with SIGNED_IN event.
 * 4. We redirect to /dashboard.
 *
 * If nothing happens after 5 seconds, we show an error with a retry button.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let redirected = false;

        const goToDashboard = () => {
            if (mounted && !redirected) {
                redirected = true;
                navigate("/dashboard", { replace: true });
            }
        };

        // Listen for the auth state change (this catches the hash fragment processing)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                goToDashboard();
            }
            // Also handle TOKEN_REFRESHED which can happen on callback
            if (event === "TOKEN_REFRESHED" && session) {
                goToDashboard();
            }
        });

        // Also do a direct session check after a short delay
        // (gives Supabase time to process the hash fragment)
        const checkTimer = setTimeout(async () => {
            if (!mounted || redirected) return;

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    if (mounted) setError(sessionError.message);
                    return;
                }

                if (session) {
                    goToDashboard();
                }
            } catch (err: any) {
                if (mounted) setError(err.message || "Failed to verify session");
            }
        }, 500);

        // Safety timeout — if nothing happens after 5 seconds, show error
        const safetyTimer = setTimeout(() => {
            if (!mounted || redirected) return;

            // Check URL hash for error info from OAuth provider
            const hash = window.location.hash;
            if (hash.includes("error_description")) {
                const params = new URLSearchParams(hash.substring(1));
                setError(params.get("error_description") || "Authentication failed");
            } else if (hash.includes("error")) {
                const params = new URLSearchParams(hash.substring(1));
                setError(params.get("error") || "Authentication failed");
            } else {
                setError("Authentication timed out. Please try again.");
            }
        }, 5000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(checkTimer);
            clearTimeout(safetyTimer);
        };
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/login", { replace: true })}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Return to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-input rounded-md hover:bg-accent"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Completing secure sign in...</p>
        </div>
    );
}
