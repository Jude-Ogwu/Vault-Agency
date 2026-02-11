import { cn } from "@/lib/utils";
import { TRANSACTION_STATUSES, TransactionStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const statusColors: Record<string, string> = {
  warning: "bg-warning/10 text-warning border-warning/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  accent: "bg-accent text-accent-foreground border-accent-foreground/20",
  success: "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-muted-foreground/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusInfo = TRANSACTION_STATUSES[status];
  const colorClass = statusColors[statusInfo.color] || statusColors.muted;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {statusInfo.label}
    </span>
  );
}
