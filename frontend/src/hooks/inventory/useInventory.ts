import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { inventoryService } from "@/services/inventory/inventoryService";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load inventory';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchArchivedItems = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const data = await inventoryService.getArchivedItems();
      setArchivedItems(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load archived items';
      toast.error(msg);
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchItems);
  }, [fetchItems]);

  const createItem = async (data: InventoryFormData, categoryName: string) => {
    try {
      const newItem = await inventoryService.createItem(data, categoryName);
      // Refetch from DB to get accurate state (balances may take a moment)
      await fetchItems();
      return newItem;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const updateItem = async (id: string, data: InventoryFormData, categoryName: string) => {
    try {
      const updated = await inventoryService.updateItem(id, data, categoryName);
      // Update local state immediately for responsiveness
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      return updated;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const archiveItem = async (id: string) => {
    try {
      await inventoryService.archiveItem(id);
      // Remove from active list immediately
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to archive item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await inventoryService.deleteItem(id);
      // Remove from active list immediately
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const restoreItem = async (id: string) => {
    try {
      await inventoryService.restoreItem(id);
      // Remove from archived list immediately, then refresh active list
      setArchivedItems(prev => prev.filter(i => i.id !== id));
      await fetchItems();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to restore item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  return {
    items,
    archivedItems,
    isLoading,
    isLoadingArchived,
    refresh: fetchItems,
    refreshArchived: fetchArchivedItems,
    createItem,
    updateItem,
    archiveItem,
    deleteItem,
    restoreItem,
  };
}
