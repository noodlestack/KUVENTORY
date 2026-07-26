import { Sale } from "@/types/sales";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface SalesTableProps {
  sales: Sale[];
  onView: (sale: Sale) => void;
}

export function SalesTable({ sales, onView }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No sales recorded</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or record a new sale.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <div className="mt-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction No.</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(sale)}>
                <TableCell className="font-mono text-sm font-medium">{sale.transactionNo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(sale.saleDate)}</TableCell>
                <TableCell>{sale.customerName || "N/A"}</TableCell>
                <TableCell>{sale.items.length} items</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                <TableCell>
                  <StatusBadge status={sale.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(sale)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sales.map((sale) => (
          <Card key={sale.id} className="cursor-pointer hover:border-primary/50" onClick={() => onView(sale)}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{sale.customerName || "Walk-in"}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{sale.transactionNo}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(sale)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {sale.items.length} items &bull; {formatDate(sale.saleDate)}
              </div>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={sale.status} />
                <span className="font-medium text-lg">{formatCurrency(sale.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
