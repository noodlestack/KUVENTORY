import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let additionalClasses = "";

  switch (status.toLowerCase()) {
    case "active":
    case "in stock":
    case "stock in":
    case "completed":
    case "delivered":
      variant = "default";
      additionalClasses = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent";
      break;
    case "inactive":
    case "pending":
    case "adjustment":
      variant = "secondary";
      additionalClasses = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-transparent";
      break;
    case "blacklisted":
    case "out of stock":
    case "low stock":
    case "stock out":
    case "cancelled":
    case "refunded":
    case "voided":
      variant = "destructive";
      additionalClasses = "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-transparent";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className={cn("font-medium", additionalClasses, className)}>
      {status}
    </Badge>
  );
}
