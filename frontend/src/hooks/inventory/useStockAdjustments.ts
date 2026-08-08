import { useState, useEffect, useCallback } from "react";
import { StockAdjustment, StockAdjustmentFormData } from "@/types/inventory";
import { inventoryService } from "@/services/inventory/inventoryService";

export function useStockAdjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdjustments = useCallback(async () => {
    setIsLoading(true);
    const data = await inventoryService.getAdjustments();
    setAdjustments(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAdjustments);
  }, [fetchAdjustments]);

  const adjustStock = async (data: StockAdjustmentFormData) => {
    const newAdj = await inventoryService.adjustStock(data);
    setAdjustments(prev => [newAdj, ...prev]);
    return newAdj;
  };

  return { adjustments, isLoading, refresh: fetchAdjustments, adjustStock };
}
