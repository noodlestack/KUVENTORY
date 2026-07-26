import { useInventoryHistory } from "@/hooks/inventory/useInventoryHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function InventoryHistory() {
  const { history, isLoading } = useInventoryHistory();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No history found</p>
        <p className="text-sm text-muted-foreground mt-1">There are no recorded actions yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <div className="space-y-6 mt-4">
      <h2 className="text-xl font-semibold">Inventory Audit Trail</h2>
      <div className="relative border-l border-muted ml-3 space-y-6">
        {history.map((entry) => (
          <div key={entry.id} className="relative pl-6">
            <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border ring-4 ring-background">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </span>
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{entry.itemName} <span className="font-normal text-muted-foreground">- {entry.action}</span></h3>
                  <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                </div>
                <p className="text-sm">{entry.details}</p>
                <p className="text-xs text-muted-foreground mt-1">Performed by: {entry.performedBy}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
