import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { CreateTransactionForm } from "@/components/transaction/CreateTransactionForm";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShoppingBag, Loader2, Shield } from "lucide-react";
import { ProductType, TransactionStatus } from "@/lib/constants";

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

type View = "list" | "create" | "detail";

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTransactions(data as Transaction[]);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setView("detail");
  };

  const handleCreateSuccess = () => {
    setView("list");
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Buyer Dashboard</h1>
                <p className="text-muted-foreground">Manage your escrow transactions</p>
              </div>
              <Button onClick={() => setView("create")} className="gradient-hero border-0 gap-2">
                <Plus className="h-4 w-4" />
                Create a Deal
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

            {/* Transactions List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your first secure transaction today
                  </p>
                  <Button onClick={() => setView("create")} className="gradient-hero border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Deal
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

        {view === "create" && (
          <div className="max-w-2xl mx-auto">
            <CreateTransactionForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setView("list")}
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
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
