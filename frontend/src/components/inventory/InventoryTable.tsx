import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, History, Trash2, PackagePlus } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onEdit, onUpdateStock, onViewHistory, onDelete }: InventoryTableProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
      case 'LOW_STOCK':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Low Stock</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Min Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                No inventory items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category_name}</TableCell>
                <TableCell>{item.supplier_name || '-'}</TableCell>
                <TableCell className="text-right font-semibold">
                  {item.current_stock} {item.unit && <span className="text-xs text-muted-foreground">{item.unit}</span>}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{item.minimum_stock}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onUpdateStock(item)} className="font-medium text-primary">
                        <PackagePlus className="mr-2 h-4 w-4" /> Update Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewHistory(item)}>
                        <History className="mr-2 h-4 w-4" /> Stock History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Info
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
