import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { InventoryItem, InventoryFormData, StockMovement, StockUpdateFormData } from "@/types/inventory";
import { inventoryService } from "@/services/inventory/inventoryService";
import { useAuth } from "@/contexts/AuthContext";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (error: any) {
      const msg = error.message || 'Failed to load inventory';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (data: InventoryFormData) => {
    try {
      await inventoryService.createItem(data);
      await fetchItems();
      toast.success("Item created successfully");
    } catch (error: any) {
      const msg = error.message || 'Failed to create item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const updateItem = async (id: string, data: InventoryFormData) => {
    try {
      await inventoryService.updateItem(id, data);
      await fetchItems();
      toast.success("Item updated successfully");
    } catch (error: any) {
      const msg = error.message || 'Failed to update item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await inventoryService.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Item deleted successfully");
    } catch (error: any) {
      const msg = error.message || 'Failed to delete item';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const updateStock = async (id: string, data: StockUpdateFormData) => {
    try {
      await inventoryService.updateStock(id, data, user?.id);
      await fetchItems();
      toast.success("Stock updated successfully");
    } catch (error: any) {
      const msg = error.message || 'Failed to update stock';
      console.error(error);
      toast.error(msg);
      throw error;
    }
  };

  const getItemMovements = async (id: string): Promise<StockMovement[]> => {
    try {
      return await inventoryService.getItemMovements(id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load history');
      return [];
    }
  };

  return {
    items,
    isLoading,
    refresh: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    getItemMovements
  };
}
