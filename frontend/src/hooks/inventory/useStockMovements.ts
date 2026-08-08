import { useState, useEffect, useCallback } from "react";
import { StockMovement } from "@/types/inventory";
import { inventoryService } from "@/services/inventory/inventoryService";

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    const data = await inventoryService.getMovements();
    setMovements(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchMovements);
  }, [fetchMovements]);

  return { movements, isLoading, refresh: fetchMovements };
}
