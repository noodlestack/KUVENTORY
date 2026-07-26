import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePurchases } from "@/hooks/purchases/usePurchases";
import { useSuppliers } from "@/hooks/suppliers/useSuppliers";
import { Purchase } from "@/types/purchases";
import { PurchaseTable } from "@/components/purchases/PurchaseTable";
import { PurchaseFormDialog } from "@/components/purchases/PurchaseFormDialog";
import { PurchaseDetailsDrawer } from "@/components/purchases/PurchaseDetailsDrawer";
import { useInventory } from "@/hooks/inventory/useInventory";

export function PurchaseRecord() {
  const { purchases, isLoading, createPurchase } = usePurchases();
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
  const { items: inventoryItems, isLoading: isLoadingInventory } = useInventory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDrawerOpen(true);
  };

  if (isLoading || isLoadingSuppliers || isLoadingInventory) {
    return <div className="p-8 text-center text-muted-foreground">Loading purchases...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Active Purchases</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search purchases..." className="pl-8" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Record Purchase
          </Button>
        </div>
      </div>
      
      <PurchaseTable 
        purchases={purchases} 
        onView={handleView}
      />

      <PurchaseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        onSubmit={createPurchase}
      />

      <PurchaseDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        purchase={selectedPurchase}
      />
    </div>
  );
}
