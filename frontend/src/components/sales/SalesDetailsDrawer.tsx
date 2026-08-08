import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sale } from "@/types/sales";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/currency";

interface SalesDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export function SalesDetailsDrawer({ open, onOpenChange, sale }: SalesDetailsDrawerProps) {
  if (!sale) return null;

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Transaction Details</SheetTitle>
          <SheetDescription className="font-mono">{sale.transactionNo}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={sale.status} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">General Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Customer</span>
                <span className="font-medium">{sale.customerName || "Walk-in Customer"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Date Recorded</span>
                <span className="font-medium">{formatDate(sale.saleDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Recorded By</span>
                <span className="font-medium">{sale.recordedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Remarks</span>
                <span className="font-medium">{sale.remarks || "None"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Items Sold</h3>
            <div className="rounded-md border bg-card text-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>

            {(sale.discountAmount || 0) > 0 && (
              <div className="flex justify-between items-center mt-2 text-destructive">
                <span>Discount</span>
                <span>-{formatCurrency(sale.discountAmount!)}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold">Net Sales</span>
              <span className="font-bold text-2xl text-primary">{formatCurrency(sale.netAmount)}</span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
