import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Package, Loader2, Wallet, TrendingUp, History, LayoutGrid, ArrowLeft } from "lucide-react";
import { ProductType, TransactionStatus } from "@/lib/constants";
import { HistoryTable } from "@/components/history/HistoryTable";
import { PayoutAccountsList } from "@/components/account/PayoutAccountsList";

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

type View = "list" | "detail" | "history" | "payout";

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("list");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);

    // Safety timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    try {
      // Fetch by seller_email (traditional) OR seller_id (invite link join)
      const [{ data: byEmail, error: emailError }, { data: byId }] = await Promise.all([
        supabase.from("transactions").select("*").eq("seller_email", user.email).order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (emailError) throw emailError;

      // Merge and deduplicate by id
      const allData = [...(byEmail || []), ...(byId || [])];
      const unique = Array.from(new Map(allData.map((t: any) => [t.id, t])).values());
      setTransactions(unique as Transaction[]);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Handle deep linking from notifications
  useEffect(() => {
    const transactionId = searchParams.get('transaction');
    if (transactionId && transactions.length > 0) {
      const target = transactions.find(t => t.id === transactionId);
      if (target) {
        setSelectedTransaction(target);
        setView("detail");
      }
    }
  }, [searchParams, transactions]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setView("detail");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const totalHeld = transactions
    .filter((t) => ["held", "pending_delivery", "pending_confirmation", "pending_release"].includes(t.status))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalReleased = transactions
    .filter((t) => t.status === "released")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {view === "list" && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold md:text-3xl">Seller Dashboard</h1>
              <p className="text-muted-foreground">View transactions where you are the seller</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 mb-8 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Incoming Transactions</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                    <Wallet className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Funds Held</p>
                    <p className="text-2xl font-bold">{formatAmount(totalHeld)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="text-2xl font-bold">{formatAmount(totalReleased)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" /> Transactions
              </Button>
              <Button
                variant={(view as any) === "history" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("history" as any)}
              >
                <History className="mr-2 h-4 w-4" /> History
              </Button>
              <Button
                variant={(view as any) === "payout" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("payout" as any)}
              >
                <Wallet className="mr-2 h-4 w-4" /> Payout Accounts
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Loading your transactions...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait, this may take a moment.</p>
              </div>
            ) : transactions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No incoming transactions</h3>
                  <p className="text-muted-foreground">
                    When buyers create transactions with your email, they'll appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction)}
                    role="seller"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {(view as any) === "history" && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Transaction History</h1>
                <p className="text-muted-foreground">View your comprehensive transaction log.</p>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("list")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" /> Transactions
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setView("history")}
              >
                <History className="mr-2 h-4 w-4" /> History
              </Button>
            </div>
            <HistoryTable />
          </>
        )}

        {(view as any) === "payout" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Payout Accounts</h1>
                <p className="text-muted-foreground">Manage your bank and crypto accounts</p>
              </div>
            </div>
            <PayoutAccountsList />
          </div>
        )}

        {view === "detail" && selectedTransaction && (
          <div className="max-w-2xl mx-auto">
            <TransactionDetail
              transaction={selectedTransaction}
              onBack={() => {
                setView("list");
                setSelectedTransaction(null);
              }}
              onUpdate={async () => {
                await fetchTransactions();
                // Refetch the specific transaction to get the latest data
                const { data } = await supabase
                  .from("transactions")
                  .select("*")
                  .eq("id", selectedTransaction.id)
                  .single();
                if (data) setSelectedTransaction(data as Transaction);
              }}
              role="seller"
            />
          </div>
        )}
      </main>

      <Footer />
    </div >
  );
}
