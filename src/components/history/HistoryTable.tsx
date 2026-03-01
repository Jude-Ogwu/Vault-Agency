import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, History } from "lucide-react";

interface HistoryItem {
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    transaction: {
        deal_title: string;
    } | null;
}

export function HistoryTable({ limit, userId }: { limit?: number; userId?: string }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            let query = supabase
                .from("transaction_history")
                .select(`
          id,
          action_type,
          description,
          created_at,
          transaction:transactions (
            deal_title
          )
        `)
                .order("created_at", { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            // If we want to filter by actor (specific user's actions), we could.
            // But typically "History" shows everything relevant to the user (via RLS).

            const { data, error } = await query;

            if (!error && data) {
                setHistory(data as any);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [limit, userId]);

    const getActionBadge = (type: string) => {
        switch (type) {
            case "transaction_created":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Created</Badge>;
            case "status_change":
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Status</Badge>;
            case "payment":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Payment</Badge>;
            case "dispute":
                return <Badge variant="destructive">Dispute</Badge>;
            case "seller_joined":
                return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Joined</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
                <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No history records found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{getActionBadge(item.action_type)}</TableCell>
                            <TableCell className="font-medium text-sm">{item.description}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                {item.transaction?.deal_title || "Unknown Deal"}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                                {format(new Date(item.created_at), "MMM d, yyyy HH:mm")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
