import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useCategories } from "@/hooks/categories/useCategories";
import { InventoryItem } from "@/types/inventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFormDialog } from "@/components/inventory/InventoryFormDialog";
import { InventoryDetailsDrawer } from "@/components/inventory/InventoryDetailsDrawer";
import { toast } from "sonner";
import { exportToCSV } from "@/utils/exportUtils";

export function InventoryList() {
  const { items, isLoading, createItem, updateItem, archiveItem, deleteItem } = useInventory();
  const { categories, isLoading: isLoadingCategories } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleArchive = async (item: InventoryItem) => {
    if (!confirm(`Archive "${item.name}"? It will be hidden from inventory but transaction history is preserved.`)) return;
    
    try {
      await archiveItem(item.id);
      toast.success(`"${item.name}" has been archived.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive item.");
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}" permanently? This cannot be undone.`)) return;
    
    try {
      await deleteItem(item.id);
      toast.success(`"${item.name}" has been deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete item.";
      if (msg.toLowerCase().includes("archive it instead")) {
        if (confirm(`Cannot delete "${item.name}" because it has existing transactions.\n\nWould you like to archive it instead?`)) {
          handleArchive(item);
        }
      } else {
        toast.error(msg);
      }
    }
  };

  const handleExport = () => {
    const exportData = items.map(item => ({
      Code: item.itemCode || '',
      Name: item.name,
      Category: item.categoryName || '',
      TotalStock: item.totalStock,
      Unit: item.unit || '',
      Cost: item.cost,
      SellingPrice: item.sellingPrice,
      MinStockLevel: item.minStockLevel,
      Status: item.status,
      LastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : ''
    }));
    exportToCSV(exportData, `Kuventory_Inventory_${new Date().toISOString().split('T')[0]}`);
    toast.success("Inventory exported successfully");
  };

  if (isLoading || isLoadingCategories) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Items</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport} disabled={items.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>
      
      <InventoryTable 
        items={items} 
        onView={handleView}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <InventoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={selectedItem}
        categories={categories}
        onSubmit={async (data, categoryName) => {
          if (selectedItem) {
            await updateItem(selectedItem.id, data, categoryName);
          } else {
            await createItem(data, categoryName);
          }
        }}
      />

      <InventoryDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        item={selectedItem}
        onEdit={() => {
          setIsDrawerOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
}
