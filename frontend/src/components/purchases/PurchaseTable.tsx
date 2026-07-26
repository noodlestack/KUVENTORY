import { Purchase } from "@/types/purchases";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface PurchaseTableProps {
  purchases: Purchase[];
  onView: (purchase: Purchase) => void;
}

export function PurchaseTable({ purchases, onView }: PurchaseTableProps) {
  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No purchases found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or record a new purchase.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <div className="mt-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(purchase)}>
                <TableCell className="font-mono text-sm font-medium">{purchase.purchaseNo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(purchase.purchaseDate)}</TableCell>
                <TableCell>{purchase.supplierName}</TableCell>
                <TableCell>{purchase.items.length} items</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(purchase.totalCost)}</TableCell>
                <TableCell>
                  <StatusBadge status={purchase.status} />
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
                      <DropdownMenuItem onClick={() => onView(purchase)}>
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
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="cursor-pointer hover:border-primary/50" onClick={() => onView(purchase)}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{purchase.supplierName}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{purchase.purchaseNo}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(purchase)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {purchase.items.length} items &bull; {formatDate(purchase.purchaseDate)}
              </div>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={purchase.status} />
                <span className="font-medium text-lg">{formatCurrency(purchase.totalCost)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
