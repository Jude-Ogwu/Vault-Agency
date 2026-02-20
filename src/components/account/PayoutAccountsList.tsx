import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayoutAccountForm } from "./PayoutAccountForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Bitcoin, Star, Pencil, Trash2, Loader2 } from "lucide-react";

interface PayoutAccount {
    id: string;
    payout_type: "bank" | "crypto";
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    crypto_currency?: string;
    wallet_address?: string;
    network?: string;
    is_default: boolean;
    created_at: string;
}

export function PayoutAccountsList() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editAccount, setEditAccount] = useState<PayoutAccount | null>(null);

    const fetchAccounts = async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase
            .from("payout_accounts")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });
        setAccounts((data as PayoutAccount[]) || []);
        setLoading(false);
    };

    useEffect(() => { fetchAccounts(); }, [user]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("payout_accounts").delete().eq("id", id);
        if (error) {
            toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Account removed" });
            fetchAccounts();
        }
    };

    const handleSetDefault = async (id: string) => {
        // Clear all defaults for user, then set this one
        await supabase.from("payout_accounts").update({ is_default: false }).eq("user_id", user!.id);
        await supabase.from("payout_accounts").update({ is_default: true }).eq("id", id);
        fetchAccounts();
    };

    if (showForm || editAccount) {
        return (
            <PayoutAccountForm
                editAccount={editAccount || undefined}
                onCancel={() => { setShowForm(false); setEditAccount(null); }}
                onSuccess={() => { setShowForm(false); setEditAccount(null); fetchAccounts(); }}
            />
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Payout Accounts</CardTitle>
                        <CardDescription>Manage where you receive funds after transaction release</CardDescription>
                    </div>
                    <Button size="sm" className="gradient-hero border-0" onClick={() => setShowForm(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Add Account
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-lg">
                        <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="font-medium">No payout accounts yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Add a bank or crypto account to receive payments</p>
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="mr-1 h-4 w-4" /> Add Account
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${account.is_default ? "border-primary/40 bg-primary/5" : "hover:bg-muted/30"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${account.payout_type === "bank" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                        }`}>
                                        {account.payout_type === "bank"
                                            ? <Building2 className="h-4 w-4" />
                                            : <Bitcoin className="h-4 w-4" />
                                        }
                                    </div>
                                    <div>
                                        {account.payout_type === "bank" ? (
                                            <>
                                                <p className="font-semibold text-sm">{account.bank_name}</p>
                                                <p className="text-xs text-muted-foreground">{account.account_number}</p>
                                                <p className="text-xs text-muted-foreground">{account.account_name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-sm">{account.crypto_currency}</p>
                                                <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                                                    {account.wallet_address}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{account.network}</p>
                                            </>
                                        )}
                                        {account.is_default && (
                                            <Badge variant="default" className="mt-1 text-[10px] px-1.5 py-0.5 h-auto">
                                                <Star className="h-2.5 w-2.5 mr-0.5" />Default
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                    {!account.is_default && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            title="Set as default"
                                            onClick={() => handleSetDefault(account.id)}
                                        >
                                            <Star className="h-3.5 w-3.5 text-muted-foreground" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEditAccount(account)}
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-destructive"
                                        onClick={() => handleDelete(account.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
