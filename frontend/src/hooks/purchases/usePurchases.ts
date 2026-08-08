import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { Purchase, PurchaseFormData } from "@/types/purchases";
import { purchaseService } from "@/services/purchases/purchaseService";

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    const data = await purchaseService.getPurchases();
    setPurchases(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchPurchases);
  }, [fetchPurchases]);

  const createPurchase = async (data: PurchaseFormData, supplierName: string) => {
    try {
    const newPurchase = await purchaseService.createPurchase(data, supplierName);
    setPurchases(prev => [newPurchase, ...prev]);
    return newPurchase;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const receivePurchase = async (purchaseId: string) => {
    try {
    await purchaseService.receivePurchase(purchaseId);
    // Refresh to get updated status and stock
    await fetchPurchases();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const cancelPurchase = async (purchaseId: string) => {
    try {
    await purchaseService.cancelPurchase(purchaseId);
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: 'Cancelled' as const } : p));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  return { purchases, isLoading, refresh: fetchPurchases, createPurchase, receivePurchase, cancelPurchase };
}

