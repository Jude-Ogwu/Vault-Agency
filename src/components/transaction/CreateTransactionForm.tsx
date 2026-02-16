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
import { Loader2, Package, Download, Briefcase, ArrowLeft, Info, MessageSquare } from "lucide-react";

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

export function CreateTransactionForm({ onSuccess, onCancel }: CreateTransactionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feePercent, setFeePercent] = useState(DEFAULT_FEE);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiateMessage, setNegotiateMessage] = useState("");
  const [negotiateSending, setNegotiateSending] = useState(false);
  const [formData, setFormData] = useState({
    dealTitle: "",
    dealDescription: "",
    amount: "",
    productType: "" as ProductType | "",
    sellerEmail: "",
    sellerPhone: "",
  });

  // Load service fee from DB
  // Note: site_settings table exists in DB but is not in the generated Supabase types yet
  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "service_fee_percent")
      .single()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data) setFeePercent(parseFloat(data.value) || DEFAULT_FEE);
      });
  }, []);

  const baseAmount = parseFloat(formData.amount) || 0;
  const serviceFee = Math.round(baseAmount * feePercent) / 100;
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
            seller_email: formData.sellerEmail.trim() || "N/A",
            negotiation_message: negotiateMessage.trim(),
            service_fee: formatNaira(serviceFee),
            total_amount: formatNaira(totalAmount),
          },
        },
      });
      toast({ title: "Negotiation request sent!", description: "Admin will contact you soon." });
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

    const { error } = await supabase.from("transactions").insert({
      deal_title: formData.dealTitle.trim(),
      deal_description: formData.dealDescription.trim() || null,
      amount: totalAmount,
      product_type: formData.productType,
      buyer_id: user.id,
      buyer_email: user.email!,
      seller_email: formData.sellerEmail.trim().toLowerCase(),
      seller_phone: formData.sellerPhone.trim() || null,
      status: "pending_payment",
    });

    if (error) {
      toast({ title: "Failed to create transaction", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Transaction created!", description: "Proceed to make payment." });
      // Fire-and-forget: don't block UI waiting for email notification
      supabase.functions.invoke("notify-transaction", {
        body: {
          event_type: "transaction_created",
          transaction: {
            deal_title: formData.dealTitle.trim(),
            amount: totalAmount,
            buyer_email: user.email!,
            seller_email: formData.sellerEmail.trim().toLowerCase(),
          },
        },
      }).catch((err) => console.warn("Email notification failed:", err));
      onSuccess();
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
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Create a secure escrow transaction</CardDescription>
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
                    Service fee ({feePercent}%)
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
                        For large transactions, you can negotiate the service fee with our admin.
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
                        onClick={handleNegotiate}
                        disabled={negotiateSending || !negotiateMessage.trim()}
                        className="w-full gradient-hero border-0"
                      >
                        {negotiateSending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <MessageSquare className="mr-1 h-3 w-3" />
                        )}
                        Send to Admin
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Seller Email */}
          <div className="space-y-2">
            <Label htmlFor="sellerEmail">Seller Email</Label>
            <Input
              id="sellerEmail"
              type="email"
              placeholder="seller@example.com"
              value={formData.sellerEmail}
              onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
              required
            />
          </div>

          {/* Seller Phone */}
          <div className="space-y-2">
            <Label htmlFor="sellerPhone">Seller Phone</Label>
            <Input
              id="sellerPhone"
              type="tel"
              placeholder="+234..."
              value={formData.sellerPhone}
              onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-hero border-0" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Transaction {baseAmount > 0 ? `(${formatNaira(totalAmount)})` : ""}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
