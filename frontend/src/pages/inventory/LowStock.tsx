import { useInventory } from "@/hooks/inventory/useInventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryDetailsDrawer } from "@/components/inventory/InventoryDetailsDrawer";
import { InventoryItem } from "@/types/inventory";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LowStock() {
  const { items, isLoading } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const lowStockItems = items.filter(i => i.endingStock <= i.minStockLevel);

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleEdit = () => {
    // For low stock, we don't open the full edit dialog directly, we might just redirect or ignore
    // Usually they click view to see supplier details
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
      </div>
      
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            There are {lowStockItems.length} items currently running low or out of stock. Consider restocking soon.
          </AlertDescription>
        </Alert>
      )}

      <InventoryTable 
        items={lowStockItems} 
        onView={handleView}
        onEdit={handleEdit}
      />

      <InventoryDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        item={selectedItem}
        onEdit={() => {}}
      />
    </div>
  );
}
