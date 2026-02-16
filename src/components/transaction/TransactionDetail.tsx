import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_TYPES, TRANSACTION_STATUSES, CRYPTO_WALLETS, ADMIN_EMAIL, ProductType, TransactionStatus, CryptoWalletKey } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePaystack, PaystackResponse } from "@/hooks/usePaystack";
import { ChatPanel } from "@/components/transaction/ChatPanel";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  Download,
  Briefcase,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  CreditCard,
  Image,
  FileText,
  Bitcoin,
  Wallet,
  Globe,
  Truck,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Store,
  Settings,
} from "lucide-react";

type PaymentMethod = "paystack" | "crypto" | "stripe" | "paypal";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  active: boolean;
  description: string;
}

const paymentMethods: PaymentOption[] = [
  { id: "paystack", name: "Paystack", icon: CreditCard, active: true, description: "Cards, Bank Transfer, USSD" },
  { id: "crypto", name: "Crypto", icon: Bitcoin, active: true, description: "BTC, USDT, ETH" },
  { id: "stripe", name: "Stripe", icon: Wallet, active: false, description: "International Cards" },
  { id: "paypal", name: "PayPal", icon: Globe, active: false, description: "PayPal Balance, Cards" },
];

interface Transaction {
  id: string;
  deal_title: string;
  deal_description?: string | null;
  amount: number;
  product_type: ProductType;
  status: TransactionStatus;
  buyer_email: string;
  seller_email: string;
  seller_phone?: string | null;
  payment_reference?: string | null;
  proof_url?: string | null;
  proof_description?: string | null;
  admin_notes?: string | null;
  created_at: string;
  paid_at?: string | null;
  delivered_at?: string | null;
  confirmed_at?: string | null;
  released_at?: string | null;
}

interface TransactionDetailProps {
  transaction: Transaction;
  onBack: () => void;
  onUpdate: () => void;
  role: "buyer" | "seller" | "admin";
}

const productIcons = {
  physical_product: Package,
  digital_product: Download,
  service: Briefcase,
};

export function TransactionDetail({ transaction, onBack, onUpdate, role }: TransactionDetailProps) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [proofDescription, setProofDescription] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cryptoProofRef = useRef<HTMLInputElement>(null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("paystack");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoWalletKey | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showCryptoPaymentForm, setShowCryptoPaymentForm] = useState(false);
  const [cryptoForm, setCryptoForm] = useState({ senderAddress: "", amountSent: "", txHash: "" });
  const [cryptoProofFile, setCryptoProofFile] = useState<File | null>(null);

  // Complaint / Refund form
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintMessage, setComplaintMessage] = useState("");
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  // Admin Manual Update
  const [manualStatus, setManualStatus] = useState<TransactionStatus | "">("");
  const [manualNote, setManualNote] = useState("");

  const ProductIcon = productIcons[transaction.product_type] || Package;
  const productLabel = PRODUCT_TYPES[transaction.product_type]?.label || "Unknown";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // --- Admin notification helper ---
  const notifyAdmin = async (eventType: string, extraData: Record<string, unknown> = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.functions.invoke("notify-transaction", {
        body: {
          event_type: eventType,
          transaction: {
            id: transaction.id,
            deal_title: transaction.deal_title,
            amount: transaction.amount,
            buyer_email: transaction.buyer_email,
            seller_email: transaction.seller_email,
            ...extraData,
          },
        },
      });
    } catch (err) {
      console.warn("Admin notification failed:", err);
    }
  };

  // --- Paystack Integration ---
  const handlePaystackSuccess = useCallback(async (response: PaystackResponse) => {
    setLoading(true);
    const { error } = await supabase
      .from("transactions")
      .update({
        status: "held",
        paid_at: new Date().toISOString(),
        payment_reference: response.reference,
      } as any)
      .eq("id", transaction.id);

    if (error) {
      toast({ title: "Payment recorded but status update failed", description: "Contact support with ref: " + response.reference, variant: "destructive" });
    } else {
      toast({ title: "Payment successful!", description: `${formatAmount(transaction.amount)} secured. Ref: ${response.reference}` });
      notifyAdmin("payment_confirmed", { payment_reference: response.reference, payment_method: "Paystack" });
      onUpdate();
    }
    setLoading(false);
  }, [transaction.id, transaction.amount]);

  const handlePaystackClose = useCallback(() => {
    toast({ title: "Payment cancelled", description: "You closed the payment window." });
  }, []);

  const { initializePayment } = usePaystack({ onSuccess: handlePaystackSuccess, onClose: handlePaystackClose });

  const handlePaystackPayment = () => {
    if (!user?.email) return;
    const reference = `TL-${transaction.id.slice(0, 8)}-${Date.now()}`;
    initializePayment(user.email, transaction.amount, reference);
  };

  // --- Crypto Payment ---
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCryptoPaymentSubmit = async () => {
    if (!selectedCrypto || !cryptoForm.amountSent) return;
    setLoading(true);

    let proofUrl = "";

    // Upload proof screenshot if provided
    if (cryptoProofFile) {
      const fileExt = cryptoProofFile.name.split(".").pop();
      const fileName = `${transaction.id}/crypto-proof-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("proofs").upload(fileName, cryptoProofFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(fileName);
        proofUrl = urlData.publicUrl;
      }
    }

    const paymentRef = `CRYPTO-${CRYPTO_WALLETS[selectedCrypto].label}-${cryptoForm.txHash || Date.now()}`;

    const { error } = await supabase
      .from("transactions")
      .update({
        status: "held",
        paid_at: new Date().toISOString(),
        payment_reference: paymentRef,
        proof_url: proofUrl || null,
        proof_description: `Crypto payment via ${CRYPTO_WALLETS[selectedCrypto].label}. Sender: ${cryptoForm.senderAddress}. Amount: ${cryptoForm.amountSent}. TX Hash: ${cryptoForm.txHash}`,
      } as any)
      .eq("id", transaction.id);

    if (error) {
      toast({ title: "Failed to record payment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment submitted!", description: "Admin will verify your crypto payment." });
      notifyAdmin("crypto_payment_submitted", {
        payment_method: CRYPTO_WALLETS[selectedCrypto].label,
        payment_reference: paymentRef,
        crypto_sender: cryptoForm.senderAddress,
        crypto_amount: cryptoForm.amountSent,
        crypto_tx_hash: cryptoForm.txHash,
        proof_url: proofUrl,
      });
      setShowCryptoPaymentForm(false);
      setCryptoForm({ senderAddress: "", amountSent: "", txHash: "" });
      setCryptoProofFile(null);
      onUpdate();
    }
    setLoading(false);
  };

  // --- Status Updates ---
  const handleUpdateStatus = async (newStatus: TransactionStatus, adminNotes?: string) => {
    setLoading(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (adminNotes) updates.admin_notes = adminNotes;
    if (newStatus === "pending_confirmation") updates.delivered_at = new Date().toISOString();
    if (newStatus === "pending_release") updates.confirmed_at = new Date().toISOString();
    if (newStatus === "released") updates.released_at = new Date().toISOString();

    const { error } = await supabase.from("transactions").update(updates).eq("id", transaction.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated", description: `Status: ${TRANSACTION_STATUSES[newStatus]?.label || newStatus}` });
      notifyAdmin(newStatus === "pending_confirmation" ? "delivery_marked" : newStatus === "pending_release" ? "buyer_confirmed" : newStatus === "released" ? "funds_released" : newStatus, { status: newStatus });
      onUpdate();
    }
    setLoading(false);
    setShowConfirmDialog(false);
  };

  // --- Refund Request ---
  const handleRefundRequest = async () => {
    if (!refundReason.trim()) return;
    setLoading(true);

    // File complaint
    await (supabase as any).from("complaints").insert({
      transaction_id: transaction.id,
      user_id: user!.id,
      user_email: user!.email!,
      role: "buyer",
      message: `REFUND REQUEST: ${refundReason.trim()}`,
    });

    // Update status
    await handleUpdateStatus("refund_requested" as any, `Buyer requests refund: ${refundReason.trim()}`);
    notifyAdmin("refund_requested", { reason: refundReason.trim() });
    setShowRefundForm(false);
    setRefundReason("");
  };

  // --- Complaint ---
  const handleComplaint = async () => {
    if (!complaintMessage.trim()) return;
    setLoading(true);

    const { error } = await (supabase as any).from("complaints").insert({
      transaction_id: transaction.id,
      user_id: user!.id,
      user_email: user!.email!,
      role: role,
      message: complaintMessage.trim(),
    });

    if (error) {
      toast({ title: "Failed to submit complaint", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Complaint submitted", description: "Admin will review your complaint." });
      notifyAdmin("complaint_filed", { complaint_from: role, complaint_message: complaintMessage.trim() });
    }
    setShowComplaintForm(false);
    setComplaintMessage("");
    setLoading(false);
  };

  // --- Proof Upload ---
  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setUploadingProof(true);
    const fileExt = file.name.split(".").pop();
    const prefix = role === "seller" ? "seller" : "buyer";
    const fileName = `${transaction.id}/${prefix}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("proofs").upload(fileName, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingProof(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(fileName);
    const { error: updateError } = await supabase.from("transactions").update({ proof_url: urlData.publicUrl, proof_description: proofDescription || null }).eq("id", transaction.id);
    if (updateError) {
      toast({ title: "Failed to save proof", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Proof uploaded!" });
      onUpdate();
    }
    setUploadingProof(false);
    setProofDescription("");
  };

  const openConfirmDialog = (action: string) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  // --- Reusable UI ---
  const renderProofUpload = (label: string) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <Textarea placeholder="Describe what you're uploading..." value={proofDescription} onChange={(e) => setProofDescription(e.target.value)} />
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleProofUpload} />
      <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploadingProof}>
        {uploadingProof ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Upload Proof
      </Button>
    </div>
  );

  const renderProofDisplay = () => {
    if (!transaction.proof_url) return null;
    return (
      <div className="rounded-lg border p-4 bg-muted/30">
        <Label className="text-muted-foreground mb-2 block">📎 Proof Uploaded</Label>
        {transaction.proof_description && <p className="text-sm mb-2">{transaction.proof_description}</p>}
        <a href={transaction.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
          {transaction.proof_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          View Proof
        </a>
      </div>
    );
  };

  // =============================================
  //  BUYER ACTIONS
  // =============================================
  const renderBuyerActions = () => {
    switch (transaction.status) {
      case "pending_payment":
        return (
          <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => method.active && setSelectedPayment(method.id)}
                    disabled={!method.active}
                    className={`relative flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${isSelected && method.active
                      ? "border-primary bg-primary/5"
                      : method.active
                        ? "border-border hover:border-primary/50"
                        : "border-border/50 opacity-60 cursor-not-allowed"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected && method.active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${isSelected && method.active ? "text-primary" : ""}`}>{method.name}</span>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    {!method.active && (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5">Coming Soon</Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Paystack Payment */}
            {selectedPayment === "paystack" && (
              <Button onClick={handlePaystackPayment} className="w-full gradient-hero border-0" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Pay {formatAmount(transaction.amount)}
              </Button>
            )}

            {/* Crypto Payment */}
            {selectedPayment === "crypto" && (
              <div className="space-y-4">
                <Label>Select Cryptocurrency</Label>
                <div className="grid gap-2">
                  {(Object.entries(CRYPTO_WALLETS) as [CryptoWalletKey, typeof CRYPTO_WALLETS[CryptoWalletKey]][]).map(
                    ([key, wallet]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setSelectedCrypto(key); setShowCryptoPaymentForm(false); }}
                        className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${selectedCrypto === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <span className="text-xl">{wallet.icon}</span>
                        <div>
                          <span className="text-sm font-medium">{wallet.label}</span>
                          <p className="text-xs text-muted-foreground">{wallet.network}</p>
                        </div>
                      </button>
                    )
                  )}
                </div>

                {/* Show wallet address */}
                {selectedCrypto && !showCryptoPaymentForm && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Send {formatAmount(transaction.amount)} worth of {CRYPTO_WALLETS[selectedCrypto].label} to:
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
                          {CRYPTO_WALLETS[selectedCrypto].address}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleCopyAddress(CRYPTO_WALLETS[selectedCrypto].address)}
                        >
                          {copiedAddress ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ Only send {CRYPTO_WALLETS[selectedCrypto].label} via {CRYPTO_WALLETS[selectedCrypto].network}
                      </p>
                    </div>

                    <Button onClick={() => setShowCryptoPaymentForm(true)} className="w-full gradient-hero border-0">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      I've Made Payment
                    </Button>
                  </div>
                )}

                {/* Crypto payment confirmation form */}
                {selectedCrypto && showCryptoPaymentForm && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <Label className="font-semibold">Payment Confirmation</Label>
                    <div className="space-y-2">
                      <Label className="text-xs">Your Wallet Address (sender)</Label>
                      <Input
                        placeholder="Enter your sending wallet address"
                        value={cryptoForm.senderAddress}
                        onChange={(e) => setCryptoForm({ ...cryptoForm, senderAddress: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Amount Sent</Label>
                      <Input
                        placeholder="e.g. 50 USDT"
                        value={cryptoForm.amountSent}
                        onChange={(e) => setCryptoForm({ ...cryptoForm, amountSent: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Transaction Hash (optional)</Label>
                      <Input
                        placeholder="Paste transaction hash"
                        value={cryptoForm.txHash}
                        onChange={(e) => setCryptoForm({ ...cryptoForm, txHash: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Upload Payment Receipt / Screenshot</Label>
                      <input
                        ref={cryptoProofRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setCryptoProofFile(e.target.files?.[0] || null)}
                      />
                      <Button variant="outline" className="w-full" onClick={() => cryptoProofRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {cryptoProofFile ? cryptoProofFile.name : "Choose File"}
                      </Button>
                    </div>
                    <Button
                      onClick={handleCryptoPaymentSubmit}
                      className="w-full gradient-hero border-0"
                      disabled={loading || !cryptoForm.amountSent}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Submit Payment Proof
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "held":
      case "pending_delivery":
        return (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Waiting for seller to deliver. Your funds are safely held.</p>
            </div>
            <Button variant="outline" onClick={() => setShowRefundForm(true)} className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
              <RotateCcw className="mr-2 h-4 w-4" />
              Request Refund
            </Button>
          </div>
        );

      case "pending_confirmation":
        return (
          <div className="space-y-4">
            {transaction.proof_url && (
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <Label className="text-success mb-2 block font-semibold">✅ Seller uploaded proof of delivery</Label>
                {transaction.proof_description && <p className="text-sm mb-2">{transaction.proof_description}</p>}
                <a href={transaction.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                  {transaction.proof_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  View Seller's Proof
                </a>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Have you received the product/service?</p>
            <Button onClick={() => openConfirmDialog("confirm")} className="w-full gradient-success border-0" disabled={loading}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Delivery & Release Funds
            </Button>
            <Button variant="outline" onClick={() => setShowRefundForm(true)} className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" /> Decline Delivery / Request Refund
            </Button>
          </div>
        );

      case "pending_release":
        return (
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm text-muted-foreground">You've confirmed delivery. Admin will release funds shortly.</p>
          </div>
        );

      case "refund_requested":
        return (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
            <RotateCcw className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-muted-foreground">Your refund request is being reviewed by admin.</p>
          </div>
        );

      default:
        return null;
    }
  };

  // =============================================
  //  SELLER ACTIONS
  // =============================================
  const renderSellerActions = () => {
    switch (transaction.status) {
      case "pending_payment":
        return (
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Waiting for buyer to make payment.</p>
          </div>
        );

      case "held":
      case "pending_delivery":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-medium text-primary mb-1">💰 {formatAmount(transaction.amount)} is secured in escrow</p>
              <p className="text-xs text-muted-foreground">Deliver the product/service, upload proof, and mark as delivered.</p>
            </div>
            {!transaction.proof_url && renderProofUpload("Upload Proof of Delivery")}
            {transaction.proof_url && renderProofDisplay()}
            <Button onClick={() => openConfirmDialog("deliver")} className="w-full gradient-hero border-0" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
              Mark as Delivered
            </Button>
          </div>
        );

      case "pending_confirmation":
        return (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <Package className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Waiting for buyer to confirm receipt.</p>
            </div>
            {transaction.proof_url && renderProofDisplay()}
            <Button variant="outline" onClick={() => setShowComplaintForm(true)} className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" /> File a Complaint
            </Button>
          </div>
        );

      case "pending_release":
        return (
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm text-muted-foreground">Buyer confirmed! Admin will release funds shortly.</p>
          </div>
        );

      case "released":
        return (
          <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-medium text-success">🎉 {formatAmount(transaction.amount)} released to you!</p>
          </div>
        );

      case "disputed":
      case "refund_requested":
        return (
          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">This transaction is under review by admin.</p>
            </div>
            <Button variant="outline" onClick={() => setShowComplaintForm(true)} className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" /> File a Complaint
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // =============================================
  //  ADMIN ACTIONS
  // =============================================
  const renderAdminActions = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {transaction.status === "pending_release" && (
            <Button onClick={() => openConfirmDialog("release")} className="w-full gradient-success border-0" disabled={loading}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Release Funds to Seller
            </Button>
          )}
          {transaction.status === "refund_requested" && (
            <>
              <Button onClick={() => openConfirmDialog("approve_refund")} className="w-full bg-destructive hover:bg-destructive/90" disabled={loading}>
                <RotateCcw className="mr-2 h-4 w-4" /> Approve Refund
              </Button>
              <Button variant="outline" onClick={() => openConfirmDialog("deny_refund")} className="w-full" disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" /> Deny Refund & Continue
              </Button>
            </>
          )}
          {transaction.status === "held" && (
            <Button onClick={() => openConfirmDialog("move_delivery")} variant="outline" className="w-full" disabled={loading}>
              <Truck className="mr-2 h-4 w-4" /> Move to Pending Delivery
            </Button>
          )}
          {transaction.status !== "released" && transaction.status !== "cancelled" && (
            <Button variant="outline" onClick={() => openConfirmDialog("dispute")} className="w-full" disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" /> Mark as Disputed
            </Button>
          )}
        </div>

        {/* Admin Manual Override */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Settings className="h-4 w-4" />
            <h3>Admin Override Zone</h3>
          </div>
          <p className="text-xs text-muted-foreground">Force update the transaction status (use with caution).</p>

          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={manualStatus} onValueChange={(val) => setManualStatus(val as TransactionStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status to force..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TRANSACTION_STATUSES) as TransactionStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {TRANSACTION_STATUSES[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Admin Note (Required for override)</Label>
            <Input
              placeholder="Reason for manual update..."
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
            />
          </div>

          <Button
            onClick={() => {
              if (manualStatus && manualNote) {
                handleUpdateStatus(manualStatus as TransactionStatus, `MANUAL OVERRIDE: ${manualNote}`);
                setManualStatus("");
                setManualNote("");
              } else {
                toast({ title: "Start Missing Details", description: "Select a status and add a note.", variant: "destructive" });
              }
            }}
            disabled={loading || !manualStatus || !manualNote}
            className="w-full"
            variant="secondary"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Force Update Status
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-escrow-lg">
        <CardHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl break-words">{transaction.deal_title}</CardTitle>
                <StatusBadge status={transaction.status} />
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <ProductIcon className="h-4 w-4" />
                {productLabel}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Transaction Amount</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary break-all">{formatAmount(transaction.amount)}</p>
          </div>

          {/* Status */}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{TRANSACTION_STATUSES[transaction.status]?.description || transaction.status}</p>
          </div>

          {/* Description */}
          {transaction.deal_description && (
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{transaction.deal_description}</p>
            </div>
          )}

          {/* Parties */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <Label className="text-muted-foreground">Buyer</Label>
              <p className="mt-1 font-medium">{transaction.buyer_email}</p>
            </div>
            <div className="rounded-lg border p-4">
              <Label className="text-muted-foreground">Seller</Label>
              <p className="mt-1 font-medium">{transaction.seller_email}</p>
              {transaction.seller_phone && <p className="text-sm text-muted-foreground">{transaction.seller_phone}</p>}
            </div>
          </div>

          {/* Payment Reference */}
          {transaction.payment_reference && (
            <div className="rounded-lg border p-4">
              <Label className="text-muted-foreground">Payment Reference</Label>
              <p className="mt-1 font-mono text-sm">{transaction.payment_reference}</p>
            </div>
          )}

          {/* Admin Notes */}
          {transaction.admin_notes && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <Label className="text-warning font-semibold">Admin Notes</Label>
              <p className="mt-1 text-sm">{transaction.admin_notes}</p>
            </div>
          )}

          {/* Proof */}
          {role === "admin" && transaction.proof_url && renderProofDisplay()}

          {/* Timeline */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Timeline</Label>
            <div className="space-y-1 text-sm">
              <p>Created: {format(new Date(transaction.created_at), "PPp")}</p>
              {transaction.paid_at && <p>Paid: {format(new Date(transaction.paid_at), "PPp")}</p>}
              {transaction.delivered_at && <p>Delivered: {format(new Date(transaction.delivered_at), "PPp")}</p>}
              {transaction.confirmed_at && <p>Confirmed: {format(new Date(transaction.confirmed_at), "PPp")}</p>}
              {transaction.released_at && <p>Released: {format(new Date(transaction.released_at), "PPp")}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            {role === "buyer" && renderBuyerActions()}
            {role === "seller" && renderSellerActions()}
            {role === "admin" && renderAdminActions()}
          </div>

          {/* Chat */}
          <div className="pt-4 border-t">
            <ChatPanel transactionId={transaction.id} role={role} />
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction === "confirm" && "Confirm delivery? This notifies admin to release funds."}
              {confirmAction === "release" && "Release funds to seller? This cannot be undone."}
              {confirmAction === "dispute" && "Mark as disputed? This requires manual resolution."}
              {confirmAction === "deliver" && "Mark as delivered? Buyer will be asked to confirm."}
              {confirmAction === "approve_refund" && "Approve refund and cancel the transaction?"}
              {confirmAction === "deny_refund" && "Deny refund and move transaction back to held?"}
              {confirmAction === "move_delivery" && "Move transaction to pending delivery status?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (confirmAction === "confirm") handleUpdateStatus("pending_release");
                if (confirmAction === "release") handleUpdateStatus("released");
                if (confirmAction === "dispute") handleUpdateStatus("disputed");
                if (confirmAction === "deliver") handleUpdateStatus("pending_confirmation");
                if (confirmAction === "approve_refund") handleUpdateStatus("cancelled", "Refund approved by admin");
                if (confirmAction === "deny_refund") handleUpdateStatus("held", "Refund denied by admin");
                if (confirmAction === "move_delivery") handleUpdateStatus("pending_delivery" as TransactionStatus);
              }}
              disabled={loading}
              className={confirmAction === "dispute" || confirmAction === "approve_refund" ? "bg-destructive hover:bg-destructive/90" : "gradient-hero border-0"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Request Form */}
      <Dialog open={showRefundForm} onOpenChange={setShowRefundForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>Explain why you want a refund. Admin will review your request.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for refund..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundForm(false)}>Cancel</Button>
            <Button onClick={handleRefundRequest} disabled={loading || !refundReason.trim()} className="bg-destructive hover:bg-destructive/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Refund Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Form */}
      <Dialog open={showComplaintForm} onOpenChange={setShowComplaintForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File a Complaint</DialogTitle>
            <DialogDescription>Describe your issue. Admin will review and take action.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Explain your complaint..."
            value={complaintMessage}
            onChange={(e) => setComplaintMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComplaintForm(false)}>Cancel</Button>
            <Button onClick={handleComplaint} disabled={loading || !complaintMessage.trim()} className="gradient-hero border-0">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
