import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useCategories } from "@/hooks/categories/useCategories";
import { InventoryItem } from "@/types/inventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFormDialog } from "@/components/inventory/InventoryFormDialog";
import { UpdateStockDialog } from "@/components/inventory/UpdateStockDialog";
import { InventoryDetailsDrawer } from "@/components/inventory/InventoryDetailsDrawer";
import { toast } from "sonner";

export function InventoryList() {
  const { items, isLoading, createItem, updateItem, deleteItem, updateStock, getItemMovements } = useInventory();
  const { categories, isLoading: isLoadingCategories } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
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

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsStockOpen(true);
  };

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}" permanently? This cannot be undone.`)) return;
    
    try {
      await deleteItem(item.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item.");
    }
  };

  const handleExport = () => {
    toast.info("Use the Reports section for full CSV/PDF exports.");
  };

  if (isLoading || isLoadingCategories) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Items</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport} disabled={items.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Note
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>
      
      <InventoryTable 
        items={items} 
        onEdit={handleEdit}
        onUpdateStock={handleUpdateStock}
        onViewHistory={handleViewHistory}
        onDelete={handleDelete}
      />

      <InventoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={selectedItem}
        categories={categories}
        onSubmit={async (data) => {
          if (selectedItem) {
            await updateItem(selectedItem.id, data);
          } else {
            await createItem(data);
          }
        }}
      />

      {selectedItem && (
        <UpdateStockDialog
          open={isStockOpen}
          onOpenChange={setIsStockOpen}
          item={selectedItem}
          onSubmit={async (data) => {
            await updateStock(selectedItem.id, data);
          }}
        />
      )}

      {selectedItem && (
        <InventoryDetailsDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          item={selectedItem}
          fetchMovements={() => getItemMovements(selectedItem.id)}
        />
      )}
    </div>
  );
}
