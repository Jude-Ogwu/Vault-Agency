import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currencies";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Search,
  LayoutGrid,
  MessageSquareWarning,
  RotateCcw,
  Settings,
  User,
  ArrowLeft,
} from "lucide-react";
import { ProductType, TransactionStatus, TRANSACTION_STATUSES } from "@/lib/constants";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { UsersTable } from "@/components/admin/UsersTable";
import { HistoryTable } from "@/components/history/HistoryTable";
import { History as HistoryIcon } from "lucide-react";

interface Transaction {
  id: string;
  deal_title: string;
  deal_description?: string | null;
  amount: number;
  product_type: ProductType;
  status: TransactionStatus;
  buyer_id?: string | null;
  seller_id?: string | null;
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

interface Complaint {
  id: string;
  transaction_id: string;
  user_id: string;
  user_email: string;
  role: string;
  message: string;
  attachment_url?: string | null;
  resolved: boolean;
  admin_response?: string | null;
  created_at: string;
}

type View = "list" | "detail" | "create" | "complaints" | "settings" | "users" | "history";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("list");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  // Complaints
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

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

  const fetchTransactions = async () => {
    setLoading(true);

    // Safety timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data as Transaction[]);
        setFilteredTransactions(data as Transaction[]);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);

    // Safety timeout
    const timeoutId = setTimeout(() => {
      setComplaintsLoading(false);
    }, 10000);

    try {
      const { data, error } = await (supabase as any)
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setComplaints(data as Complaint[]);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      clearTimeout(timeoutId);
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchTransactions();
      fetchComplaints();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.deal_title.toLowerCase().includes(search) ||
          t.buyer_email.toLowerCase().includes(search) ||
          t.seller_email.toLowerCase().includes(search) ||
          (t.seller_phone && t.seller_phone.toLowerCase().includes(search)) ||
          (t.payment_reference && t.payment_reference.toLowerCase().includes(search)) ||
          t.id.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, transactions]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setView("detail");
  };

  const handleResolveComplaint = async (complaintId: string) => {
    const { error } = await (supabase as any)
      .from("complaints")
      .update({
        resolved: true,
        admin_response: adminResponse.trim() || "Resolved by admin",
      })
      .eq("id", complaintId);

    if (error) {
      toast({ title: "Failed to resolve", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Complaint resolved" });
      setRespondingTo(null);
      setAdminResponse("");
      fetchComplaints();
    }
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, "NGN");
  };

  const totalHeld = transactions
    .filter((t) => ["held", "pending_delivery", "pending_confirmation", "pending_release"].includes(t.status))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const pendingRelease = transactions.filter((t) => t.status === "pending_release").length;
  const disputed = transactions.filter((t) => t.status === "disputed" || t.status === "refund_requested").length;
  const unresolvedComplaints = complaints.filter((c) => !c.resolved).length;

  if (authLoading || (!isAdmin && user)) {
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
              <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage all escrow transactions</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <LayoutGrid className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
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
                    <p className="text-sm text-muted-foreground">Held</p>
                    <p className="text-2xl font-bold">{formatAmount(totalHeld)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={pendingRelease > 0 ? "border-success/50" : ""}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Release</p>
                    <p className="text-2xl font-bold">{pendingRelease}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={disputed > 0 ? "border-destructive/50" : ""}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disputed/Refunds</p>
                    <p className="text-2xl font-bold">{disputed}</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={unresolvedComplaints > 0 ? "border-orange-400/50 cursor-pointer hover:shadow-md transition-all" : "cursor-pointer hover:shadow-md transition-all"}
                onClick={() => setView("complaints")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <MessageSquareWarning className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complaints</p>
                    <p className="text-2xl font-bold">{unresolvedComplaints}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide md:overflow-visible md:pb-0 md:mx-0 md:px-0">
              <div className="flex gap-2 min-w-max">
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("list")}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" /> Transactions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("complaints")}
                  className="relative"
                >
                  <MessageSquareWarning className="mr-2 h-4 w-4" /> Complaints
                  {unresolvedComplaints > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-[10px] px-1.5">{unresolvedComplaints}</Badge>
                  )}
                </Button>
                <Button
                  variant={(view as any) === "users" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("users")}
                >
                  <User className="mr-2 h-4 w-4" /> Users
                </Button>
                <Button
                  variant={(view as any) === "history" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("history")}
                >
                  <HistoryIcon className="mr-2 h-4 w-4" /> History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, buyer, or seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus | "all")}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(Object.keys(TRANSACTION_STATUSES) as TransactionStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {TRANSACTION_STATUSES[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Loading transactions...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait, this may take a moment.</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Transactions will appear here when created"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction)}
                    role="admin"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === "users" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold md:text-3xl">User Management</h1>
              <p className="text-muted-foreground">Manage authorized users, suspensions, and permissions.</p>
            </div>
            <UsersTable onBack={() => setView("list")} />
          </>
        )}

        {view === "history" && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">System History</h1>
                <p className="text-muted-foreground">Audit log of all transaction activities.</p>
              </div>
            </div>
            <HistoryTable limit={100} />
          </>
        )}

        {/* Complaints View */}
        {view === "complaints" && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setView("list")}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">Complaints & Refund Requests</h1>
                  <p className="text-muted-foreground">Review and resolve issues from buyers and sellers</p>
                </div>
              </div>
            </div>

            {complaintsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : complaints.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-success/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
                  <p className="text-muted-foreground">All clear! No issues to resolve.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <Card key={complaint.id} className={complaint.resolved ? "opacity-60" : "border-orange-400/30"}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={complaint.role === "buyer" ? "default" : "secondary"} className="text-xs">
                            {complaint.role}
                          </Badge>
                          <span className="text-sm font-medium">{complaint.user_email}</span>
                          {complaint.resolved ? (
                            <Badge className="bg-success/20 text-success text-xs">Resolved</Badge>
                          ) : (
                            <Badge className="bg-orange-500/20 text-orange-600 text-xs">Open</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm mb-3 whitespace-pre-wrap">{complaint.message}</p>

                      {complaint.attachment_url && (
                        <a
                          href={complaint.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-block mb-3"
                        >
                          📎 View Attachment
                        </a>
                      )}

                      <p className="text-xs text-muted-foreground mb-3">
                        Transaction: {complaint.transaction_id.slice(0, 8)}...
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs h-auto p-0 ml-2"
                          onClick={() => {
                            const tx = transactions.find((t) => t.id === complaint.transaction_id);
                            if (tx) handleTransactionClick(tx);
                          }}
                        >
                          View Transaction →
                        </Button>
                      </p>

                      {complaint.admin_response && (
                        <div className="rounded-lg bg-primary/5 p-3 mt-2">
                          <Label className="text-xs text-muted-foreground">Admin Response:</Label>
                          <p className="text-sm mt-1">{complaint.admin_response}</p>
                        </div>
                      )}

                      {!complaint.resolved && (
                        <div className="mt-3">
                          {respondingTo === complaint.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Your response to this complaint..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleResolveComplaint(complaint.id)}
                                  className="gradient-hero border-0"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setRespondingTo(null); setAdminResponse(""); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRespondingTo(complaint.id)}
                            >
                              <MessageSquareWarning className="mr-1 h-3 w-3" /> Respond & Resolve
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
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
                fetchComplaints();
                const { data } = await supabase
                  .from("transactions")
                  .select("*")
                  .eq("id", selectedTransaction.id)
                  .single();
                if (data) setSelectedTransaction(data as Transaction);
              }}
              role="admin"
            />
          </div>
        )}

        {view === "settings" && (
          <AdminSettings onBack={() => setView("list")} />
        )}
      </main>

      <Footer />
    </div>
  );
}
