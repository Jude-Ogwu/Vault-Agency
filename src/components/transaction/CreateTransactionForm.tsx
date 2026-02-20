import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_TYPES, ADMIN_EMAIL, ProductType } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Download, Briefcase, ArrowLeft, Info, MessageSquare, Link2, Copy, Share2, CheckCheck } from "lucide-react";

const DEFAULT_FEE = 5;

const productIcons = {
  physical_product: Package,
  digital_product: Download,
  service: Briefcase,
};

interface CreateTransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateTransactionForm({ onSuccess, onCancel, initialData }: CreateTransactionFormProps & { initialData?: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feeConfig, setFeeConfig] = useState({
    defaultPercent: 5,
    highValuePercent: 2,
    threshold: 10000
  });
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [negotiateSending, setNegotiateSending] = useState(false);
  const [useInviteLink, setUseInviteLink] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    dealTitle: initialData?.deal_title || "",
    dealDescription: initialData?.deal_description || "",
    amount: initialData?.amount ? initialData.amount.toString() : "",
    productType: (initialData?.product_type as ProductType) || "" as ProductType | "",
  });

  // Calculate base amount for display if initialData exists
  useEffect(() => {
    if (initialData?.amount && feeConfig.defaultPercent) {
      const total = initialData.amount;
      // Reverse logic to guess base amount
      // Try high value rate first
      let derivedBase = total / (1 + feeConfig.highValuePercent / 100);

      if (derivedBase < feeConfig.threshold) {
        // If derived base is less than threshold, then it must have been the default rate
        derivedBase = total / (1 + feeConfig.defaultPercent / 100);
      }

      // Update form if not already set by user interaction
      setFormData(prev => {
        // Only set if we haven't touched it (simplified check: if it matches initial string or empty)
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
        data.forEach((setting) => {
          if (setting.key === "service_fee_percent") config.defaultPercent = parseFloat(setting.value) || 5;
          if (setting.key === "high_value_fee_percent") config.highValuePercent = parseFloat(setting.value) || 2;
          if (setting.key === "high_value_threshold") config.threshold = parseFloat(setting.value) || 10000;
        });
        setFeeConfig(config);
      }
    };
    fetchSettings();
  }, []);

  const baseAmount = parseFloat(formData.amount) || 0;
  // Tiered logic: if baseAmount >= threshold, use highValuePercent, else use defaultPercent
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
    };

    let error;
    let transactionId = initialData?.id;

    if (initialData) {
      const { data, error: updateError } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", initialData.id)
        .select()
        .single();

      error = updateError;
      if (data) transactionId = data.id;
    } else {
      const { data, error: insertError } = await supabase.from("transactions").insert({
        ...transactionData,
        buyer_id: user.id,
        buyer_email: user.email!,
        status: "pending_payment",
      }).select().single();

      error = insertError;
      if (data) transactionId = data.id;

      // Generate invite link if toggled
      if (!error && transactionId && useInviteLink) {
        const token = crypto.randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
        await supabase.from("invite_links").insert({
          transaction_id: transactionId,
          token,
          created_by: user.id,
          expires_at: expiresAt,
        } as any);
        // Store token on transaction for easy lookup
        await supabase.from("transactions").update({ invite_token: token } as any).eq("id", transactionId);
        const inviteUrl = `${window.location.origin}/invite/${token}`;
        setGeneratedInviteUrl(inviteUrl);
      }
    }

    if (error) {
      toast({ title: initialData ? "Failed to update" : "Failed to create", description: error.message, variant: "destructive" });
    } else {
      toast({ title: initialData ? "Transaction updated!" : "Transaction created!", description: useInviteLink ? "Share the invite link with your seller." : "Proceed to make payment." });

      if (!initialData && transactionId) {
        // Notify EA via email that a new transaction was created
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
      }
      // Only call onSuccess if NOT showing invite link (so user can share first)
      if (!useInviteLink || initialData) onSuccess();
    }

    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-escrow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{initialData ? "Edit Transaction" : "New Transaction"}</CardTitle>
            <CardDescription>{initialData ? "Update transaction details" : "Create a secure escrow transaction"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type Selection */}
          <div className="space-y-3">
            <Label>Product Type</Label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {(Object.entries(PRODUCT_TYPES) as [ProductType, typeof PRODUCT_TYPES[ProductType]][]).map(
                ([key, value]) => {
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
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                        {value.label}
                      </span>
                    </button>
                  );
                }
              )}
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

          {/* Transaction Description */}
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

          {/* Amount with fee calculation */}
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

          {/* Invite via Link toggle (only on new transactions) */}
          {!initialData && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Invite Seller via Link
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate a shareable invite link to send to your seller after creating the transaction.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useInviteLink}
                  onClick={() => setUseInviteLink(!useInviteLink)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${useInviteLink ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${useInviteLink ? "translate-x-5" : "translate-x-0"
                    }`} />
                </button>
              </div>
              <p className="text-xs text-primary mt-2 font-medium">
                {useInviteLink
                  ? "✓ A unique invite link will be generated after you create the transaction."
                  : "Toggle on to generate an invite link for your seller."}
              </p>
            </div>
          )}

          {/* Invite Link Share UI (after creation) */}
          {generatedInviteUrl && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <CheckCheck className="h-4 w-4" />
                Transaction created! Share this invite link with your seller:
              </div>
              <div className="flex gap-2">
                <Input value={generatedInviteUrl} readOnly className="text-xs" />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(generatedInviteUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const text = `You've been invited as a seller on Escrow Africa!\n\nTransaction: ${formData.dealTitle}\nAmount: ₦${baseAmount.toLocaleString()}\n\nClick to accept:\n${generatedInviteUrl}`;
                    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(wa, "_blank");
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" /> Share via WhatsApp
                </Button>
                <Button type="button" size="sm" className="flex-1" onClick={onSuccess}>
                  Done
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-hero border-0" disabled={loading || !!generatedInviteUrl}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Transaction" : "Create Transaction"} {baseAmount > 0 ? `(${formatNaira(totalAmount)})` : ""}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
