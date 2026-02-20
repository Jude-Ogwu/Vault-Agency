import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_TYPES, ProductType } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Package, Download, Briefcase, ArrowLeft, Info, MessageSquare,
  Copy, CheckCheck, Share2, Mail, ExternalLink
} from "lucide-react";

const productIcons = {
  physical_product: Package,
  digital_product: Download,
  service: Briefcase,
};

interface CreateTransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SOCIAL_PLATFORMS = [
  {
    name: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20b858] text-white",
    icon: "💬",
    getUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    name: "Telegram",
    color: "bg-[#0088cc] hover:bg-[#007ab8] text-white",
    icon: "✈️",
    getUrl: (text: string, url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "X (Twitter)",
    color: "bg-black hover:bg-zinc-800 text-white",
    icon: "𝕏",
    getUrl: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#166ad8] text-white",
    icon: "📘",
    getUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Instagram",
    color: "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white",
    icon: "📸",
    getUrl: () => `https://www.instagram.com/`,
  },
  {
    name: "TikTok",
    color: "bg-black hover:bg-zinc-800 text-white",
    icon: "🎵",
    getUrl: () => `https://www.tiktok.com/`,
  },
  {
    name: "Email",
    color: "bg-slate-600 hover:bg-slate-700 text-white",
    icon: "✉️",
    getUrl: (text: string) =>
      `mailto:?subject=You're invited as a seller on Escrow Africa&body=${encodeURIComponent(text)}`,
  },
] as const;

export function CreateTransactionForm({ onSuccess, onCancel, initialData }: CreateTransactionFormProps & { initialData?: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feeConfig, setFeeConfig] = useState({ defaultPercent: 5, highValuePercent: 2, threshold: 10000 });
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [negotiateSending, setNegotiateSending] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dealTitle, setDealTitle] = useState("");

  const [formData, setFormData] = useState({
    dealTitle: initialData?.deal_title || "",
    dealDescription: initialData?.deal_description || "",
    amount: initialData?.amount ? initialData.amount.toString() : "",
    productType: (initialData?.product_type as ProductType) || "" as ProductType | "",
  });

  // Reverse-calculate base amount from total if editing
  useEffect(() => {
    if (initialData?.amount && feeConfig.defaultPercent) {
      const total = initialData.amount;
      let derivedBase = total / (1 + feeConfig.highValuePercent / 100);
      if (derivedBase < feeConfig.threshold) {
        derivedBase = total / (1 + feeConfig.defaultPercent / 100);
      }
      setFormData(prev => {
        if (prev.amount === "" || prev.amount === initialData.amount.toString()) {
          return { ...prev, amount: derivedBase.toFixed(2) };
        }
        return prev;
      });
    }
  }, [initialData, feeConfig]);

  // Load service fee settings from DB
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["service_fee_percent", "high_value_fee_percent", "high_value_threshold"]);
      if (data) {
        const config = { ...feeConfig };
        data.forEach((s) => {
          if (s.key === "service_fee_percent") config.defaultPercent = parseFloat(s.value) || 5;
          if (s.key === "high_value_fee_percent") config.highValuePercent = parseFloat(s.value) || 2;
          if (s.key === "high_value_threshold") config.threshold = parseFloat(s.value) || 10000;
        });
        setFeeConfig(config);
      }
    };
    fetchSettings();
  }, []);

  const baseAmount = parseFloat(formData.amount) || 0;
  const activeFeePercent = baseAmount >= feeConfig.threshold ? feeConfig.highValuePercent : feeConfig.defaultPercent;
  const serviceFee = Math.round(baseAmount * activeFeePercent) / 100;
  const totalAmount = baseAmount + serviceFee;

  const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

  const handleNegotiate = async () => {
    if (!negotiateMessage.trim() || !user) return;
    setNegotiateSending(true);
    try {
      await supabase.functions.invoke("notify-transaction", {
        body: {
          event_type: "fee_negotiation",
          transaction: {
            deal_title: formData.dealTitle.trim() || "New Deal",
            amount: baseAmount,
            buyer_email: user.email!,
            negotiation_message: negotiateMessage.trim(),
            service_fee: formatNaira(serviceFee),
            total_amount: formatNaira(totalAmount),
          },
        },
      });
      toast({ title: "Negotiation request sent!", description: "EA will contact you soon." });
      setShowNegotiate(false);
      setNegotiateMessage("");
    } catch {
      toast({ title: "Failed to send", description: "Try again or contact support.", variant: "destructive" });
    }
    setNegotiateSending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Not authenticated", description: "Please log in.", variant: "destructive" });
      return;
    }
    if (baseAmount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    if (!formData.productType) {
      toast({ title: "Select product type", description: "Please select a product type.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const transactionData = {
      deal_title: formData.dealTitle.trim(),
      deal_description: formData.dealDescription.trim() || null,
      amount: totalAmount,
      product_type: formData.productType,
      seller_email: "", // Will be updated when seller joins via invite link
    };

    let error;
    let transactionId = initialData?.id;

    if (initialData) {
      // Editing: update existing transaction
      const { data, error: updateError } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", initialData.id)
        .select()
        .single();
      error = updateError;
      if (data) transactionId = data.id;
    } else {
      // Creating: insert new transaction
      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert({
          ...transactionData,
          buyer_id: user.id,
          buyer_email: user.email!,
          status: "pending_payment",
        })
        .select()
        .single();
      error = insertError;
      if (data) transactionId = data.id;

      // Always auto-generate invite link for new transactions
      if (!error && transactionId) {
        const token = crypto.randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
        await supabase.from("invite_links").insert({
          transaction_id: transactionId,
          token,
          created_by: user.id,
          expires_at: expiresAt,
        });
        await supabase.from("transactions").update({ invite_token: token }).eq("id", transactionId);
        const inviteUrl = `${window.location.origin}/invite/${token}`;
        setGeneratedInviteUrl(inviteUrl);
        setDealTitle(formData.dealTitle.trim());
      }
    }

    if (error) {
      toast({
        title: initialData ? "Failed to update" : "Failed to create",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Notify EA via email
      supabase.functions.invoke("notify-transaction", {
        body: {
          event_type: "transaction_created",
          transaction: {
            deal_title: formData.dealTitle.trim(),
            amount: totalAmount,
            buyer_email: user.email!,
          },
        },
      }).catch((err) => console.warn("Email notification failed:", err));

      toast({
        title: initialData ? "Transaction updated!" : "Transaction created!",
        description: initialData ? "Details updated." : "Share the invite link with your seller.",
      });

      if (initialData) onSuccess();
      // For new transactions, wait for user to share before calling onSuccess
    }

    setLoading(false);
  };

  const getShareText = () =>
    `You've been invited as a seller on Escrow Africa!\n\nTransaction: ${dealTitle}\nAmount: ${formatNaira(baseAmount)}\n\nClick to accept the invite:\n${generatedInviteUrl}`;

  const handleCopy = async () => {
    if (!generatedInviteUrl) return;
    await navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Invite Link Share Screen ─────────────────────────────────────────────────
  if (generatedInviteUrl) {
    return (
      <Card className="border-0 shadow-escrow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>Transaction Created!</CardTitle>
              <CardDescription>Share the invite link with your seller to get started</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Amount summary */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Transaction Amount</p>
            <p className="text-xl font-bold text-primary">{formatNaira(totalAmount)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{dealTitle}</p>
          </div>

          {/* Invite link box */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              Your Seller Invite Link
            </Label>
            <div className="flex gap-2">
              <Input value={generatedInviteUrl} readOnly className="text-xs font-mono bg-muted" />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⏳ This link expires in <strong>72 hours</strong>. Send it to your seller to get them started.
            </p>
          </div>

          {/* Social share buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Share via</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => {
                    const url = platform.getUrl(getShareText(), generatedInviteUrl);
                    window.open(url, "_blank");
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${platform.color}`}
                >
                  <span className="text-base">{platform.icon}</span>
                  <span className="truncate">{platform.name}</span>
                  {platform.name === "Instagram" || platform.name === "TikTok" ? (
                    <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                  ) : null}
                </button>
              ))}
              {/* Generic share */}
              {"share" in navigator ? (
                <button
                  type="button"
                  onClick={() =>
                    navigator.share({
                      title: "Escrow Africa Invite",
                      text: getShareText(),
                      url: generatedInviteUrl,
                    })
                  }
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors col-span-2 sm:col-span-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span>More options</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Done button */}
          <div className="pt-2 border-t">
            <Button onClick={onSuccess} className="w-full gradient-hero border-0">
              Done — Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Main Form ────────────────────────────────────────────────────────────────
  return (
    <Card className="border-0 shadow-escrow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{initialData ? "Edit Transaction" : "New Transaction"}</CardTitle>
            <CardDescription>
              {initialData ? "Update transaction details" : "Create a secure escrow transaction"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type */}
          <div className="space-y-3">
            <Label>Product Type</Label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {(Object.entries(PRODUCT_TYPES) as [ProductType, typeof PRODUCT_TYPES[ProductType]][]).map(([key, value]) => {
                const Icon = productIcons[key];
                const isSelected = formData.productType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: key })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>{value.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction Title */}
          <div className="space-y-2">
            <Label htmlFor="dealTitle">Transaction Title</Label>
            <Input
              id="dealTitle"
              placeholder="e.g., iPhone 15 Pro Max"
              value={formData.dealTitle}
              onChange={(e) => setFormData({ ...formData, dealTitle: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="dealDescription">Description (Optional)</Label>
            <Textarea
              id="dealDescription"
              placeholder="Describe the product or service details..."
              value={formData.dealDescription}
              onChange={(e) => setFormData({ ...formData, dealDescription: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Product Price (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-8"
                min="100"
                step="0.01"
                required
              />
            </div>

            {/* Fee breakdown */}
            {baseAmount > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Product price</span>
                  <span>{formatNaira(baseAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Service fee ({activeFeePercent}%)
                  </span>
                  <span>{formatNaira(serviceFee)}</span>
                </div>
                <div className="border-t pt-1.5 flex items-center justify-between font-semibold">
                  <span>Total you'll pay</span>
                  <span className="text-primary">{formatNaira(totalAmount)}</span>
                </div>

                {/* Negotiate */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNegotiate(!showNegotiate)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Negotiate service fee?
                  </button>

                  {showNegotiate && (
                    <div className="mt-2 space-y-2 rounded-lg border p-3 bg-card">
                      <p className="text-xs text-muted-foreground">
                        For large transactions, you can negotiate the service fee with our EA.
                      </p>
                      <Textarea
                        placeholder="Explain your transaction and preferred fee..."
                        value={negotiateMessage}
                        onChange={(e) => setNegotiateMessage(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={negotiateSending || !negotiateMessage.trim()}
                        onClick={handleNegotiate}
                        className="w-full gradient-hero border-0"
                      >
                        {negotiateSending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <MessageSquare className="mr-1 h-3 w-3" />
                        )}
                        Send to EA
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info banner */}
          {!initialData && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">Invite link will be auto-generated</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    After creating this transaction, you'll get a shareable link to send to your seller via WhatsApp, Telegram, Email, and more.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-hero border-0" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Transaction" : "Create Transaction"}{" "}
              {baseAmount > 0 ? `(${formatNaira(totalAmount)})` : ""}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
