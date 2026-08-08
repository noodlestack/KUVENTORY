import { formatCurrency } from "@/utils/currency";

interface DiscountSummaryRibbonProps {
  discountName: string;
  percentage?: number;
  amount?: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

export function DiscountSummaryRibbon({ 
  discountName, 
  percentage, 
  amount, 
  discountAmount, 
  originalAmount, 
  finalAmount 
}: DiscountSummaryRibbonProps) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 mt-4">
      <div className="flex justify-between items-center border-b border-primary/10 pb-2">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Discount Applied</p>
          <p className="font-medium text-primary">{discountName}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {percentage ? `${percentage}%` : formatCurrency(amount || 0)}
          </span>
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Original Amount</span>
          <span>{formatCurrency(originalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount Amount</span>
          <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
        </div>
        <div className="flex justify-between font-bold pt-1">
          <span>Final Amount</span>
          <span className="text-primary">{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
