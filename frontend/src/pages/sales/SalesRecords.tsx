import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSales } from "@/hooks/sales/useSales";
import { useInventory } from "@/hooks/inventory/useInventory";
import { Sale } from "@/types/sales";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesFormDialog } from "@/components/sales/SalesFormDialog";
import { SalesDetailsDrawer } from "@/components/sales/SalesDetailsDrawer";

export function SalesRecords() {
  const { sales, isLoading, recordSale } = useSales();
  const { items: inventoryItems, isLoading: isLoadingInventory } = useInventory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDrawerOpen(true);
  };

  if (isLoading || isLoadingInventory) {
    return <div className="p-8 text-center text-muted-foreground">Loading sales records...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Transaction Records</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." className="pl-8" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Record Sale
          </Button>
        </div>
      </div>
      
      <SalesTable 
        sales={sales} 
        onView={handleView}
      />

      <SalesFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        inventoryItems={inventoryItems}
        onSubmit={recordSale}
      />

      <SalesDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        sale={selectedSale}
      />
    </div>
  );
}
