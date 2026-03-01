import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Ban } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SuspendedPage() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
            <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center border-t-4 border-destructive">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                    <Ban className="h-8 w-8 text-destructive" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>

                <p className="text-muted-foreground mb-6">
                    Your account has been suspended by the Escrow Nigeria administrators.
                    You rarely lose access without a valid reason.
                </p>

                {user && (user as any).suspension_reason && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 mb-6 text-left">
                        <p className="text-xs font-semibold text-destructive uppercase mb-1">Reason for suspension:</p>
                        <p className="text-sm">{String((user as any).suspension_reason)}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={handleSignOut} className="w-full">
                        Sign Out
                    </Button>
                    <Button variant="link" className="text-xs text-muted-foreground" onClick={() => window.location.href = "mailto:support@escrownigeria.com"}>
                        Contact Support
                    </Button>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                <span>Escrow Nigeria Security</span>
            </div>
        </div>
    );
}
