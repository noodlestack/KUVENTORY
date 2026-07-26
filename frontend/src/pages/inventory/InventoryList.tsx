import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useCategories } from "@/hooks/categories/useCategories";
import { InventoryItem } from "@/types/inventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFormDialog } from "@/components/inventory/InventoryFormDialog";
import { InventoryDetailsDrawer } from "@/components/inventory/InventoryDetailsDrawer";

export function InventoryList() {
  const { items, isLoading, createItem, updateItem } = useInventory();
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

  if (isLoading || isLoadingCategories) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Items</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <InventoryTable 
        items={items} 
        onView={handleView}
        onEdit={handleEdit}
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
