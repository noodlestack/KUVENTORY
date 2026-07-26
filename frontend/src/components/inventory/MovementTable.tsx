import { StockMovement } from "@/types/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

interface MovementTableProps {
  movements: StockMovement[];
}

export function MovementTable({ movements }: MovementTableProps) {
  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No movements found</p>
        <p className="text-sm text-muted-foreground mt-1">There are no recorded stock movements yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <div className="mt-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ref No.</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-sm text-muted-foreground">{formatDate(movement.date)}</TableCell>
                <TableCell className="font-mono text-xs">{movement.referenceNo}</TableCell>
                <TableCell>
                  <div className="font-medium">{movement.itemName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{movement.itemCode}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={movement.type} />
                </TableCell>
                <TableCell className={`text-right font-medium ${movement.quantity > 0 ? "text-success" : movement.quantity < 0 ? "text-destructive" : ""}`}>
                  {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                </TableCell>
                <TableCell>{movement.performedBy}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate" title={movement.remarks}>{movement.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {movements.map((movement) => (
          <Card key={movement.id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{movement.itemName}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{movement.referenceNo}</p>
                </div>
                <div className={`text-right font-bold text-lg ${movement.quantity > 0 ? "text-success" : movement.quantity < 0 ? "text-destructive" : ""}`}>
                  {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={movement.type} />
                <span className="text-sm text-muted-foreground">{formatDate(movement.date)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
