import { useState, useEffect, useCallback } from "react";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { mockInventoryService } from "@/services/inventory/mockInventoryService";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const data = await mockInventoryService.getInventory();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchItems);
  }, [fetchItems]);

  const createItem = async (data: InventoryFormData, categoryName: string) => {
    const newItem = await mockInventoryService.createItem(data, categoryName);
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = async (id: string, data: InventoryFormData, categoryName: string) => {
    const updated = await mockInventoryService.updateItem(id, data, categoryName);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  return { items, isLoading, refresh: fetchItems, createItem, updateItem };
}
