import { useState, useEffect, useCallback } from "react";
import { Sale, SaleFormData, SalesSummaryData } from "@/types/sales";
import { salesService } from "@/services/sales/salesService";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    const data = await salesService.getSales();
    setSales(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSales);
  }, [fetchSales]);

  const recordSale = async (data: SaleFormData) => {
    const newSale = await salesService.createSale(data);
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  return { sales, isLoading, refresh: fetchSales, recordSale };
}

export function useSalesSummary() {
  const [summary, setSummary] = useState<SalesSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    const data = await salesService.getSalesSummary();
    setSummary(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSummary);
  }, [fetchSummary]);

  return { summary, isLoading, refresh: fetchSummary };
}
