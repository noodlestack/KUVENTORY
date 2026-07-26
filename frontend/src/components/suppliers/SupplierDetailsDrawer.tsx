import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Supplier } from "@/types/suppliers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface SupplierDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onEdit: () => void;
}

export function SupplierDetailsDrawer({ open, onOpenChange, supplier, onEdit }: SupplierDetailsDrawerProps) {
  if (!supplier) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(dateStr)) : "Never";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader className="mb-6 flex flex-row justify-between items-start">
          <div>
            <SheetTitle className="text-2xl">{supplier.name}</SheetTitle>
            <SheetDescription>Added on {formatDate(supplier.dateAdded)}</SheetDescription>
          </div>
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <StatusBadge status={supplier.status} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Contact Person</span>
                <span className="font-medium">{supplier.contactPerson}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Phone Number</span>
                <span className="font-medium">{supplier.phoneNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Email Address</span>
                <span className="font-medium">{supplier.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Physical Address</span>
                <span className="font-medium">{supplier.address}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Total Purchases</span>
                <span className="font-medium text-lg">{supplier.totalPurchases}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Purchase</span>
                <span className="font-medium">{formatDate(supplier.lastPurchaseDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Notes</h3>
            <p className="text-sm">{supplier.notes || "No additional remarks."}</p>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
