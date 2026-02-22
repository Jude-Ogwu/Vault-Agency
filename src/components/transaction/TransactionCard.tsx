import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PRODUCT_TYPES, TransactionStatus, ProductType } from "@/lib/constants";
import { Package, Download, Briefcase, Calendar, Banknote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionCardProps {
  transaction: {
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
    created_at: string;
  };
  onClick?: () => void;
  role: "buyer" | "seller" | "admin";
}

const productIcons = {
  physical_product: Package,
  digital_product: Download,
  service: Briefcase,
};

export function TransactionCard({ transaction, onClick, role }: TransactionCardProps) {
  const ProductIcon = productIcons[transaction.product_type] || Package;
  const productLabel = PRODUCT_TYPES[transaction.product_type]?.label || "Unknown";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-escrow-md hover:border-primary/20"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ProductIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight break-words">{transaction.deal_title}</h3>
              <p className="text-xs text-muted-foreground">{productLabel}</p>
            </div>
          </div>
          <StatusBadge status={transaction.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {transaction.deal_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {transaction.deal_description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Banknote className="h-4 w-4" />
            <span className="font-semibold text-foreground">{formatAmount(transaction.amount)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className={`flex ${role === "admin" ? "flex-col gap-1" : "items-center justify-between"} text-xs text-muted-foreground pt-2 border-t min-w-0`}>
          {role === "admin" ? (
            <>
              <span className="truncate">Buyer: {transaction.buyer_email}</span>
              <span className="truncate">Seller: {transaction.seller_email}</span>
              {(transaction as any).seller_phone && <span className="truncate">Phone: {(transaction as any).seller_phone}</span>}
            </>
          ) : (
            <>
              {role === "buyer" && (
                <span className="truncate font-mono text-xs">
                  Seller ID: {transaction.seller_id
                    ? transaction.seller_id.slice(0, 8).toUpperCase()
                    : <span className="italic text-muted-foreground">Pending join</span>}
                </span>
              )}
              {role === "seller" && (
                <span className="truncate font-mono text-xs">
                  Buyer ID: {transaction.buyer_id
                    ? transaction.buyer_id.slice(0, 8).toUpperCase()
                    : <span className="italic text-muted-foreground">Unknown</span>}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
