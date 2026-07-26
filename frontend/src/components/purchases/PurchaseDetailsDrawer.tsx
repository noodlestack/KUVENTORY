import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Purchase } from "@/types/purchases";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PurchaseDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
}

export function PurchaseDetailsDrawer({ open, onOpenChange, purchase }: PurchaseDetailsDrawerProps) {
  if (!purchase) return null;

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Purchase Details</SheetTitle>
          <SheetDescription className="font-mono">{purchase.purchaseNo}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={purchase.status} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">General Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Supplier</span>
                <span className="font-medium">{purchase.supplierName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Purchase Date</span>
                <span className="font-medium">{formatDate(purchase.purchaseDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Recorded By</span>
                <span className="font-medium">{purchase.recordedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Remarks</span>
                <span className="font-medium">{purchase.remarks || "None"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Items Purchased</h3>
            <div className="rounded-md border bg-card text-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="font-semibold">Total Cost</span>
              <span className="font-bold text-xl">{formatCurrency(purchase.totalCost)}</span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
