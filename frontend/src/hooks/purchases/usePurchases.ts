import { useState, useEffect, useCallback } from "react";
import { Purchase, PurchaseFormData } from "@/types/purchases";
import { mockPurchaseService } from "@/services/purchases/mockPurchaseService";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    const data = await mockPurchaseService.getPurchases();
    setPurchases(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchPurchases);
  }, [fetchPurchases]);

  const createPurchase = async (data: PurchaseFormData, supplierName: string) => {
    const newPurchase = await mockPurchaseService.createPurchase(data, supplierName);
    setPurchases(prev => [newPurchase, ...prev]);
    return newPurchase;
  };

  return { purchases, isLoading, refresh: fetchPurchases, createPurchase };
}
