import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Product } from "@/types/products";
import { StatusBadge } from "@/components/common/StatusBadge";

interface ProductDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailsDrawer({ open, onOpenChange, product }: ProductDetailsDrawerProps) {
  if (!product) return null;

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{product.name}</SheetTitle>
          <SheetDescription>SKU: {product.sku}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={product.status} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Category</span>
                <span className="font-medium">{product.categoryName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Description</span>
                <span className="font-medium">{product.description || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Pricing & Inventory</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Cost Price</span>
                <span className="font-medium">{formatCurrency(product.costPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Selling Price</span>
                <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Current Stock</span>
                <span className="font-medium">{product.stockLevel}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Min Stock Level</span>
                <span className="font-medium">{product.minStockLevel}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">System Information</h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Created At</span>
                <span className="font-medium">{formatDate(product.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Updated</span>
                <span className="font-medium">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
