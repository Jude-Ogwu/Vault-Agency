import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
    Shield, Clock, Package, DollarSign, User,
    Loader2, CheckCircle, XCircle, LogIn, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

type InviteState =
    | "loading"
    | "valid"
    | "invalid"
    | "expired"
    | "already_used"
    | "joining"
    | "joined"
    | "own_link";

export default function InviteLink() {
    const { token } = useParams<{ token: string }>();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [state, setState] = useState<InviteState>("loading");
    const [transaction, setTransaction] = useState<any>(null);
    const [inviteLink, setInviteLink] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!authLoading) fetchInviteData();
    }, [token, authLoading]);

    // Countdown timer
    useEffect(() => {
        if (!inviteLink?.expires_at) return;
        const interval = setInterval(() => {
            const diff = new Date(inviteLink.expires_at).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [inviteLink]);

    async function fetchInviteData() {
        if (!token) { setState("invalid"); return; }

        const { data: link, error } = await supabase
            .from("invite_links")
            .select("*, transactions(*)")
            .eq("token", token)
            .single();

        if (error || !link) { setState("invalid"); return; }

        setInviteLink(link);
        setTransaction(link.transactions);

        // Check expired
        if (new Date(link.expires_at) < new Date() || !link.is_active) {
            setState("expired"); return;
        }
        // Check already used
        if (link.used_by) { setState("already_used"); return; }
        // Check own link
        if (user && link.created_by === user.id) { setState("own_link"); return; }

        setState("valid");
    }

    async function handleJoin() {
        if (!user) {
            // Redirect to login with return URL
            navigate(`/login?redirect=/invite/${token}`);
            return;
        }

        setState("joining");
        try {
            // Mark invite as used
            await supabase
                .from("invite_links")
                .update({ used_by: user.id, used_at: new Date().toISOString(), is_active: false })
                .eq("token", token!);

            // Update transaction with seller_id and status → seller_joined
            await supabase
                .from("transactions")
                .update({
                    seller_id: user.id,
                    status: "seller_joined" as any,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", transaction.id);

            // Notify buyer
            await supabase.from("notifications").insert({
                user_id: transaction.buyer_id,
                title: "Seller Has Joined!",
                message: `${user.email} has joined your transaction: "${transaction.deal_title}". You can now proceed to payment.`,
                type: "success",
                link: `/dashboard/transaction/${transaction.id}`,
            } as any);

            setState("joined");
            toast({ title: "You've joined the transaction!", description: "The buyer has been notified." });
        } catch (err) {
            setState("valid");
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        }
    }

    // ─── UI States ───────────────────────────────────────────────────────────────

    if (state === "loading" || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (state === "invalid") {
        return <StatusPage icon={<XCircle className="h-12 w-12 text-destructive" />}
            title="Invalid Link" description="This invite link does not exist or is malformed." />;
    }

    if (state === "expired") {
        return <StatusPage icon={<Clock className="h-12 w-12 text-warning" />}
            title="Link Expired" description="This invite link has expired. Please ask the buyer to generate a new one." />;
    }

    if (state === "already_used") {
        return <StatusPage icon={<CheckCircle className="h-12 w-12 text-success" />}
            title="Already Used" description="This invite link has already been used to join the transaction." />;
    }

    if (state === "own_link") {
        return <StatusPage icon={<AlertTriangle className="h-12 w-12 text-warning" />}
            title="Your Own Link" description="You created this transaction. Share this link with the seller instead." />;
    }

    if (state === "joined") {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <Card className="max-w-md w-full text-center border-success/40 bg-success/5">
                        <CardContent className="pt-8 pb-6">
                            <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">You've Joined!</h2>
                            <p className="text-muted-foreground mb-6">
                                You're now the seller on this transaction. The buyer will be notified to proceed with payment.
                            </p>
                            <Button onClick={() => navigate("/seller")} className="w-full">
                                Go to Seller Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    // ─── Valid State ──────────────────────────────────────────────────────────────
    const fee = transaction.amount < 10000
        ? transaction.amount * 0.05
        : transaction.amount * 0.02;
    const sellerReceives = transaction.amount - fee;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full space-y-4">

                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <Shield className="h-4 w-4" />
                            Escrow Africa — Secure Transaction Invite
                        </div>
                        <h1 className="text-2xl font-bold">You've been invited as a Seller</h1>
                        <p className="text-muted-foreground mt-1">
                            Review the transaction details below before accepting.
                        </p>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-warning" />
                        <span className="text-muted-foreground">Invite expires in:</span>
                        <span className="font-mono font-semibold text-warning">{timeLeft}</span>
                    </div>

                    {/* Transaction Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                {transaction.deal_title}
                            </CardTitle>
                            {transaction.deal_description && (
                                <CardDescription>{transaction.deal_description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <div className="text-muted-foreground text-xs mb-1">Transaction Amount</div>
                                    <div className="font-semibold text-lg">₦{transaction.amount.toLocaleString()}</div>
                                </div>
                                <div className="rounded-lg bg-success/10 p-3">
                                    <div className="text-muted-foreground text-xs mb-1">You'll Receive</div>
                                    <div className="font-semibold text-lg text-success">₦{sellerReceives.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground text-center">
                                EA service fee: ₦{fee.toLocaleString()} ({transaction.amount < 10000 ? "5" : "2"}%)
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Buyer:</span>
                                    <span className="font-medium">{transaction.buyer_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="secondary" className="capitalize">
                                        {transaction.product_type?.replace(/_/g, " ")}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{format(new Date(transaction.created_at), "MMM d, yyyy")}</span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                                <strong className="text-foreground">How it works:</strong> After you accept, the buyer will pay into
                                Escrow Africa's secure escrow. Funds are only released to you once the buyer confirms delivery.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action */}
                    {user ? (
                        <Button
                            className="w-full h-12 text-base"
                            onClick={handleJoin}
                            disabled={state === "joining"}
                        >
                            {state === "joining" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
                            ) : (
                                <><CheckCircle className="mr-2 h-5 w-5" /> Accept & Join as Seller</>
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <Button className="w-full h-12" onClick={() => navigate(`/login?redirect=/invite/${token}`)}>
                                <LogIn className="mr-2 h-5 w-5" /> Log In to Accept
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/signup?redirect=/invite/${token}`)}>
                                Create Account & Accept
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                You need an account to accept this invite.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ─── Reusable status page ─────────────────────────────────────────────────────
function StatusPage({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="flex justify-center mb-4">{icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-muted-foreground mb-6">{description}</p>
                        <Button variant="outline" onClick={() => navigate("/")}>Go to Home</Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
