import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Percent, Wallet, Phone, Mail } from "lucide-react";

interface Setting {
    key: string;
    value: string;
}

const SETTING_LABELS: Record<string, { label: string; description: string; icon: React.ElementType; group: string }> = {
    service_fee_percent: { label: "Standard Fee (%)", description: "Fee for transactions below threshold", icon: Percent, group: "Business" },
    high_value_fee_percent: { label: "High Value Fee (%)", description: "Fee for transactions above threshold", icon: Percent, group: "Business" },
    high_value_threshold: { label: "High Value Threshold (₦)", description: "Amount where high value fee applies", icon: Wallet, group: "Business" },
    admin_email: { label: "EA Email", description: "Email for all notifications", icon: Mail, group: "Contact" },
    whatsapp_number: { label: "WhatsApp Number", description: "Support WhatsApp number", icon: Phone, group: "Contact" },
    call_number: { label: "Call Number", description: "Support phone number", icon: Phone, group: "Contact" },
    call_hours_start: { label: "Call Hours Start (24h)", description: "e.g. 8 for 8 AM", icon: Phone, group: "Contact" },
    call_hours_end: { label: "Call Hours End (24h)", description: "e.g. 18 for 6 PM", icon: Phone, group: "Contact" },
    crypto_btc_address: { label: "BTC Wallet", description: "Bitcoin wallet address", icon: Wallet, group: "Crypto Wallets" },
    crypto_usdt_trc20_address: { label: "USDT TRC20 Wallet", description: "USDT on Tron network", icon: Wallet, group: "Crypto Wallets" },
    crypto_usdt_erc20_address: { label: "USDT ERC20 Wallet", description: "USDT on Ethereum network", icon: Wallet, group: "Crypto Wallets" },
    crypto_eth_address: { label: "ETH Wallet", description: "Ethereum wallet address", icon: Wallet, group: "Crypto Wallets" },
};

interface AdminSettingsProps {
    onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
    const { toast } = useToast();
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("site_settings")
            .select("*");

        if (!error && data) {
            const map: Record<string, string> = {};
            (data as Setting[]).forEach((s) => (map[s.key] = s.value));
            setSettings(map);
            setOriginalSettings({ ...map });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const changedKeys = Object.keys(settings).filter((k) => settings[k] !== originalSettings[k]);

        if (changedKeys.length === 0) {
            toast({ title: "No changes to save" });
            setSaving(false);
            return;
        }

        let hasError = false;
        for (const key of changedKeys) {
            const { error } = await supabase
                .from("site_settings")
                .update({ value: settings[key], updated_at: new Date().toISOString() })
                .eq("key", key);

            if (error) {
                toast({ title: `Failed to save ${key}`, description: error.message, variant: "destructive" });
                hasError = true;
            }
        }

        if (!hasError) {
            toast({ title: "Settings saved!", description: `${changedKeys.length} setting(s) updated.` });
            setOriginalSettings({ ...settings });
        }
        setSaving(false);
    };

    const hasChanges = Object.keys(settings).some((k) => settings[k] !== originalSettings[k]);

    // Group settings
    const groups: Record<string, string[]> = {};
    Object.keys(SETTING_LABELS).forEach((key) => {
        const group = SETTING_LABELS[key].group;
        if (!groups[group]) groups[group] = [];
        groups[group].push(key);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
                        <p className="text-muted-foreground">Manage platform configuration</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="gradient-hero border-0"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="space-y-6">
                {Object.entries(groups).map(([groupName, keys]) => (
                    <Card key={groupName}>
                        <CardHeader>
                            <CardTitle className="text-lg">{groupName}</CardTitle>
                            <CardDescription>
                                {groupName === "Business" && "Revenue and fee configuration"}
                                {groupName === "Contact" && "Support contact information"}
                                {groupName === "Crypto Wallets" && "Wallet addresses for crypto payments"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {keys.map((key) => {
                                const meta = SETTING_LABELS[key];
                                if (!meta) return null;
                                const Icon = meta.icon;
                                const changed = settings[key] !== originalSettings[key];

                                return (
                                    <div key={key} className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-sm">
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            {meta.label}
                                            {changed && <span className="text-xs text-orange-500 font-normal">(modified)</span>}
                                        </Label>
                                        <Input
                                            value={settings[key] || ""}
                                            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                                            placeholder={meta.description}
                                            className={changed ? "border-orange-400/50" : ""}
                                        />
                                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info */}
            <Card className="mt-6 border-dashed">
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">💡 What can you change here?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Service fee %</strong> — changes what buyers pay on new transactions</li>
                        <li>• <strong>Contact details</strong> — updates support widget & footer</li>
                        <li>• <strong>Crypto wallets</strong> — changes wallet addresses shown to buyers</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                        <strong>Note:</strong> For changes to take effect in the app, users may need to refresh their browser.
                        Some settings (like the fee %) update instantly for new transactions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
