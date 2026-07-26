import { useState, useEffect, useCallback } from "react";
import { StockMovement } from "@/types/inventory";
import { mockInventoryService } from "@/services/inventory/mockInventoryService";

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    const data = await mockInventoryService.getMovements();
    setMovements(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, isLoading, refresh: fetchMovements };
}
