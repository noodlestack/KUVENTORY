import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InventoryItem } from "@/types/inventory";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface InventoryDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onEdit: () => void;
}

export function InventoryDetailsDrawer({ open, onOpenChange, item, onEdit }: InventoryDetailsDrawerProps) {
  if (!item) return null;

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader className="mb-6 flex flex-row justify-between items-start">
          <div>
            <SheetTitle className="text-2xl">{item.name}</SheetTitle>
            <SheetDescription>Code: {item.itemCode}</SheetDescription>
          </div>
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <StatusBadge status={item.status} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Item Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Category</span>
                <span className="font-medium">{item.categoryName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Supplier</span>
                <span className="font-medium">{item.supplier}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Storage Location</span>
                <span className="font-medium">{item.storageLocation}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Notes</span>
                <span className="font-medium">{item.notes || "None"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Stock Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Ending Stock</span>
                <span className="font-medium text-lg">{item.endingStock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Min Stock Level</span>
                <span className="font-medium text-lg">{item.minStockLevel} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">System Records</h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Added On</span>
                <span className="font-medium">{formatDate(item.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Updated</span>
                <span className="font-medium">{formatDate(item.lastUpdated)}</span>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
