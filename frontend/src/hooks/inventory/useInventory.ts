import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { inventoryService } from "@/services/inventory/inventoryService";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const data = await inventoryService.getInventory();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchItems);
  }, [fetchItems]);

  const createItem = async (data: InventoryFormData, categoryName: string) => {
    try {
    const newItem = await inventoryService.createItem(data, categoryName);
    // Refetch from DB to ensure accurate stock state
    await fetchItems();
    return newItem;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const updateItem = async (id: string, data: InventoryFormData, categoryName: string) => {
    try {
    const updated = await inventoryService.updateItem(id, data, categoryName);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const archiveItem = async (id: string) => {
    try {
    await inventoryService.archiveItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  return { items, isLoading, refresh: fetchItems, createItem, updateItem, archiveItem };
}
