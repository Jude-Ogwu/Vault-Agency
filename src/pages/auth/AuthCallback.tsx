import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const handleAuth = async () => {
            try {
                // 1. Immediate check: Do we already have a session?
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                if (session) {
                    if (mounted) navigate("/dashboard");
                    return;
                }

                // 2. If no session, listen for the event (which triggers after hash processing)
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (mounted) {
                        if (event === "SIGNED_IN" && session) {
                            navigate("/dashboard");
                        } else if (event === "SIGNED_OUT") {
                            // Only redirect to login if we specifically get a signed out event vs just initializing
                            // navigate("/login");
                        }
                    }
                });

                // 3. Fallback/Safety: If hash exists but nothing happened after a short delay
                setTimeout(async () => {
                    if (!mounted) return;
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    if (currentSession) {
                        navigate("/dashboard");
                    } else {
                        // If we have an error hash in URL
                        const fragment = window.location.hash;
                        if (fragment.includes("error_description")) {
                            const params = new URLSearchParams(fragment.substring(1));
                            setError(params.get("error_description"));
                        }
                    }
                }, 1000); // Check again after 1s

                return () => {
                    subscription.unsubscribe();
                };

            } catch (err: any) {
                if (mounted) setError(err.message || "Authentication failed");
            }
        };

        handleAuth();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <Loader2 className="h-8 w-8 text-destructive animate-spin" />
                    {/* Using spinner as placeholdericon or finding an error icon if handy, but changing color */}
                </div>
                <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Return to Login
                </button>
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
