import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStockAdjustments } from "@/hooks/inventory/useStockAdjustments";
import { useInventory } from "@/hooks/inventory/useInventory";
import { AdjustmentDialog } from "@/components/inventory/AdjustmentDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export function StockAdjustment() {
  const { adjustments, isLoading, adjustStock } = useStockAdjustments();
  const { items, isLoading: isItemsLoading } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr));

  if (isLoading || isItemsLoading) return <div className="p-8 text-center text-muted-foreground">Loading adjustments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Stock Adjustments</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Adjustment
          </Button>
        </div>
      </div>

      <AdjustmentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        items={items} 
        onSubmit={adjustStock} 
      />

      {adjustments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
          <p className="text-lg font-medium">No adjustments found</p>
          <p className="text-sm text-muted-foreground mt-1">There are no recorded stock adjustments yet.</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="hidden md:block rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Previous</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Adjusted By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(adj.date)}</TableCell>
                    <TableCell className="font-medium">{adj.itemName}</TableCell>
                    <TableCell className="text-right">{adj.currentQuantity}</TableCell>
                    <TableCell className="text-right font-medium">{adj.actualQuantity}</TableCell>
                    <TableCell className={`text-right font-bold ${adj.difference > 0 ? "text-success" : adj.difference < 0 ? "text-destructive" : ""}`}>
                      {adj.difference > 0 ? "+" : ""}{adj.difference}
                    </TableCell>
                    <TableCell>{adj.reason}</TableCell>
                    <TableCell>{adj.adjustedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {adjustments.map((adj) => (
              <Card key={adj.id}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{adj.itemName}</h3>
                      <p className="text-xs text-muted-foreground">{adj.reason}</p>
                    </div>
                    <div className={`text-right font-bold text-lg ${adj.difference > 0 ? "text-success" : adj.difference < 0 ? "text-destructive" : ""}`}>
                      {adj.difference > 0 ? "+" : ""}{adj.difference}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{adj.currentQuantity} &rarr; {adj.actualQuantity}</span>
                    <span>{formatDate(adj.date)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
