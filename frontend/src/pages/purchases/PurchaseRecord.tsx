import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePurchases } from "@/hooks/purchases/usePurchases";
import { useSuppliers } from "@/hooks/suppliers/useSuppliers";
import { Purchase } from "@/types/purchases";
import { PurchaseTable } from "@/components/purchases/PurchaseTable";
import { PurchaseFormDialog } from "@/components/purchases/PurchaseFormDialog";
import { PurchaseDetailsDrawer } from "@/components/purchases/PurchaseDetailsDrawer";
import { useInventory } from "@/hooks/inventory/useInventory";
import { toast } from "sonner";
import { exportToCSV } from "@/utils/exportUtils";

export function PurchaseRecord() {
  const { purchases, isLoading, createPurchase, receivePurchase, cancelPurchase } = usePurchases();
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
  const { items: inventoryItems, isLoading: isLoadingInventory } = useInventory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDrawerOpen(true);
  };

  const handleReceive = async (purchaseId: string) => {
    try {
      await receivePurchase(purchaseId);
      toast.success("Purchase marked as received. Stock has been updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to receive purchase";
      toast.error(msg);
    }
  };

  const handleCancel = async (purchaseId: string) => {
    try {
      await cancelPurchase(purchaseId);
      toast.success("Purchase cancelled.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel purchase";
      toast.error(msg);
    }
  };

  const filteredPurchases = purchases.filter(p =>
    p.purchaseNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredPurchases.map(p => ({
      PurchaseNo: p.purchaseNo,
      Supplier: p.supplierName,
      Date: new Date(p.purchaseDate).toLocaleDateString(),
      Status: p.status,
      ItemsCount: p.items.length,
      TotalCost: p.totalCost,
      RecordedBy: p.recordedBy
    }));
    exportToCSV(exportData, `Kuventory_Purchases_${new Date().toISOString().split('T')[0]}`);
    toast.success("Purchases exported successfully");
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
            <Input
              placeholder="Search purchases..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleExport} disabled={filteredPurchases.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Record Purchase
          </Button>
        </div>
      </div>
      
      <PurchaseTable 
        purchases={filteredPurchases} 
        onView={handleView}
        onReceive={handleReceive}
        onCancel={handleCancel}
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
