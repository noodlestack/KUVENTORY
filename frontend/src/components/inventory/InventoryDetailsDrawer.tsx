import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InventoryItem, StockMovement } from "@/types/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface InventoryDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  fetchMovements: () => Promise<StockMovement[]>;
}

export function InventoryDetailsDrawer({ open, onOpenChange, item, fetchMovements }: InventoryDetailsDrawerProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && item) {
      setIsLoading(true);
      fetchMovements().then(data => {
        setMovements(data);
        setIsLoading(false);
      });
    }
  }, [open, item, fetchMovements]);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ADD':
        return <Badge variant="default" className="bg-green-500">Stock In</Badge>;
      case 'REMOVE':
        return <Badge variant="secondary" className="bg-red-500 text-white">Stock Out</Badge>;
      case 'ADJUST':
        return <Badge variant="outline">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{item.name} - Stock History</SheetTitle>
          <SheetDescription>
            SKU: {item.sku} | Current Stock: {item.current_stock} {item.unit}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading history...</div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recent Movements</h3>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(mov.created_at).toLocaleDateString()} {new Date(mov.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                        <TableCell>{getMovementBadge(mov.movement_type)}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          mov.movement_type === 'REMOVE' ? 'text-red-500' : 
                          mov.movement_type === 'ADD' ? 'text-green-500' : ''
                        }`}>
                          {mov.movement_type === 'REMOVE' ? '-' : (mov.movement_type === 'ADD' ? '+' : '')}
                          {mov.quantity}
                        </TableCell>
                        <TableCell className="text-right font-bold">{mov.new_stock}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mov.reason || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
