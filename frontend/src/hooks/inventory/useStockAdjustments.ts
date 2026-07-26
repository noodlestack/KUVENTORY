import { useState, useEffect, useCallback } from "react";
import { StockAdjustment, StockAdjustmentFormData } from "@/types/inventory";
import { mockInventoryService } from "@/services/inventory/mockInventoryService";

export function useStockAdjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdjustments = useCallback(async () => {
    setIsLoading(true);
    const data = await mockInventoryService.getAdjustments();
    setAdjustments(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const adjustStock = async (data: StockAdjustmentFormData) => {
    const newAdj = await mockInventoryService.adjustStock(data);
    setAdjustments(prev => [newAdj, ...prev]);
    return newAdj;
  };

  return { adjustments, isLoading, refresh: fetchAdjustments, adjustStock };
}
