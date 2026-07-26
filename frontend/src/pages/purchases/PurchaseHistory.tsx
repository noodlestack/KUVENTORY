import { usePurchases } from "@/hooks/purchases/usePurchases";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export function PurchaseHistory() {
  const { purchases, isLoading } = usePurchases();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No purchase history found</p>
        <p className="text-sm text-muted-foreground mt-1">There are no recorded purchases yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <div className="space-y-6 mt-4">
      <h2 className="text-xl font-semibold">Purchase Timeline</h2>
      <div className="relative border-l border-muted ml-3 space-y-6">
        {purchases.map((entry) => (
          <div key={entry.id} className="relative pl-6">
            <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border ring-4 ring-background">
              <Receipt className="h-3 w-3 text-muted-foreground" />
            </span>
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{entry.purchaseNo} <span className="font-normal text-muted-foreground">- {entry.supplierName}</span></h3>
                  <span className="text-xs text-muted-foreground">{formatDate(entry.purchaseDate)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {entry.items.length} item(s) purchased for a total of <span className="font-bold text-foreground">{formatCurrency(entry.totalCost)}</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">Status: {entry.status} &bull; Recorded by: {entry.recordedBy}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
