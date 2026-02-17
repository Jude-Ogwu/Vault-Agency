import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { CreateTransactionForm } from "@/components/transaction/CreateTransactionForm";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShoppingBag, Loader2, Shield, History, LayoutGrid, ArrowLeft } from "lucide-react";
import { ProductType, TransactionStatus } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { HistoryTable } from "@/components/history/HistoryTable";


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

type View = "list" | "create" | "detail" | "history";

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("list");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { toast } = useToast();


  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data as Transaction[]);
      }
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setView("create");
  };

  const handleDelete = async (transactionId: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Transaction deleted" });
      setView("list");
      setSelectedTransaction(null);
      fetchTransactions();
    }
  };

  const handleCreateSuccess = () => {
    setView("list");
    setEditingTransaction(null);
    fetchTransactions();
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Buyer Dashboard</h1>
                <p className="text-muted-foreground">Manage your escrow transactions</p>
              </div>
              <Button onClick={() => setView("create")} className="gradient-hero border-0 gap-2">
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 mb-8 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                    <Shield className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Funds Held</p>
                    <p className="text-2xl font-bold">
                      {transactions.filter((t) => t.status === "held" || t.status === "pending_delivery" || t.status === "pending_confirmation" || t.status === "pending_release").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {transactions.filter((t) => t.status === "released").length}
                    </p>
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
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your first secure transaction today
                  </p>
                  <Button onClick={() => { setEditingTransaction(null); setView("create"); }} className="gradient-hero border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    New Transaction
                  </Button>
                </CardContent>
              </Card>

            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction)}
                    role="buyer"
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

        {view === "create" && (
          <div className="max-w-2xl mx-auto">
            <CreateTransactionForm
              initialData={editingTransaction}
              onSuccess={handleCreateSuccess}
              onCancel={() => {
                setEditingTransaction(null);
                setView("list");
              }}
            />
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
              role="buyer"
              onEdit={() => handleEdit(selectedTransaction)}
              onDelete={() => handleDelete(selectedTransaction.id)}
            />
          </div>
        )}
      </main>

      <Footer />
    </div >
  );
}
