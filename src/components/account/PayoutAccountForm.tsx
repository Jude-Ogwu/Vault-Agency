import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Bitcoin, ArrowLeft } from "lucide-react";

const NIGERIAN_BANKS = [
    "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
    "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Globus Bank",
    "Guaranty Trust Bank (GTBank)", "Heritage Bank", "Jaiz Bank", "Keystone Bank",
    "Kuda Bank", "Lotus Bank", "Moniepoint MFB", "Opay", "PalmPay",
    "Parallex Bank", "Polaris Bank", "Providus Bank", "Stanbic IBTC Bank",
    "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank", "TAJBank",
    "Titan Trust Bank", "Union Bank of Nigeria", "United Bank for Africa (UBA)",
    "Unity Bank", "VFD Microfinance Bank", "Wema Bank", "Zenith Bank",
];

const CRYPTO_OPTIONS = [
    { value: "USDT_TRC20", label: "USDT (TRC20 — Tron)", network: "Tron Network" },
    { value: "USDT_ERC20", label: "USDT (ERC20 — Ethereum)", network: "Ethereum Network" },
    { value: "BTC", label: "Bitcoin (BTC)", network: "Bitcoin Network" },
    { value: "ETH", label: "Ethereum (ETH)", network: "Ethereum Network" },
    { value: "BNB", label: "BNB (BEP20)", network: "BSC Network" },
    { value: "USDC_ERC20", label: "USDC (ERC20)", network: "Ethereum Network" },
];

interface PayoutAccountFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    editAccount?: any;
}

export function PayoutAccountForm({ onSuccess, onCancel, editAccount }: PayoutAccountFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<"bank" | "crypto">(editAccount?.payout_type || "bank");

    const [bank, setBank] = useState({
        bank_name: editAccount?.bank_name || "",
        account_number: editAccount?.account_number || "",
        account_name: editAccount?.account_name || "",
    });
    const [crypto, setCrypto] = useState({
        crypto_currency: editAccount?.crypto_currency || "",
        wallet_address: editAccount?.wallet_address || "",
        network: editAccount?.network || "",
    });

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const payload: any = {
            user_id: user.id,
            payout_type: tab,
            updated_at: new Date().toISOString(),
        };

        if (tab === "bank") {
            if (!bank.bank_name || !bank.account_number || !bank.account_name) {
                toast({ title: "Please fill all bank fields", variant: "destructive" });
                setLoading(false);
                return;
            }
            Object.assign(payload, bank);
        } else {
            if (!crypto.crypto_currency || !crypto.wallet_address) {
                toast({ title: "Please fill all crypto fields", variant: "destructive" });
                setLoading(false);
                return;
            }
            const selected = CRYPTO_OPTIONS.find(c => c.value === crypto.crypto_currency);
            Object.assign(payload, { ...crypto, network: selected?.network || "" });
        }

        let error;
        if (editAccount) {
            ({ error } = await supabase.from("payout_accounts").update(payload).eq("id", editAccount.id));
        } else {
            ({ error } = await supabase.from("payout_accounts").insert(payload));
        }

        if (error) {
            toast({ title: "Failed to save", description: error.message, variant: "destructive" });
        } else {
            toast({ title: editAccount ? "Account updated!" : "Account added!" });
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>{editAccount ? "Edit Payout Account" : "Add Payout Account"}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Tab switcher */}
                <div className="flex gap-2 rounded-lg border p-1 bg-muted/30">
                    <button
                        type="button"
                        onClick={() => setTab("bank")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${tab === "bank" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Building2 className="h-4 w-4" /> Bank Account
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("crypto")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${tab === "crypto" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Bitcoin className="h-4 w-4" /> Crypto Wallet
                    </button>
                </div>

                {tab === "bank" ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Select value={bank.bank_name} onValueChange={(v) => setBank({ ...bank, bank_name: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NIGERIAN_BANKS.map((b) => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                                placeholder="0123456789"
                                maxLength={10}
                                value={bank.account_number}
                                onChange={(e) => setBank({ ...bank, account_number: e.target.value.replace(/\D/g, "") })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Name</Label>
                            <Input
                                placeholder="JOHN DOE"
                                value={bank.account_name}
                                onChange={(e) => setBank({ ...bank, account_name: e.target.value.toUpperCase() })}
                            />
                            <p className="text-xs text-muted-foreground">As it appears on your bank statement</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cryptocurrency</Label>
                            <Select value={crypto.crypto_currency} onValueChange={(v) => setCrypto({ ...crypto, crypto_currency: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cryptocurrency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRYPTO_OPTIONS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Wallet Address</Label>
                            <Input
                                placeholder="Your wallet address..."
                                value={crypto.wallet_address}
                                onChange={(e) => setCrypto({ ...crypto, wallet_address: e.target.value })}
                                className="font-mono text-sm"
                            />
                        </div>
                        {crypto.crypto_currency && (
                            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                Network: <strong>{CRYPTO_OPTIONS.find(c => c.value === crypto.crypto_currency)?.network}</strong>
                                <br />Make sure you send only {crypto.crypto_currency} on this network to avoid loss of funds.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                    <Button className="flex-1 gradient-hero border-0" onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editAccount ? "Update Account" : "Save Account"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
