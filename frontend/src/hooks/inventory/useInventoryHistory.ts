import { useState, useEffect, useCallback } from "react";
import { InventoryHistoryEntry } from "@/types/inventory";
import { mockInventoryService } from "@/services/inventory/mockInventoryService";

export function useInventoryHistory() {
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await mockInventoryService.getHistory();
    setHistory(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, refresh: fetchHistory };
}
