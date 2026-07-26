import { useState, useEffect, useCallback } from "react";
import { mockReportsService } from "@/services/reports/mockReportsService";
import { 
  AnalyticsSummary, 
  SalesReport, 
  InventoryReport, 
  PurchaseReport, 
  ExpenseReport, 
  SupplierReport 
} from "@/types/reports";

export function useAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getAnalyticsSummary();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useSalesReport() {
  const [data, setData] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getSalesReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useInventoryReport() {
  const [data, setData] = useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getInventoryReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function usePurchaseReport() {
  const [data, setData] = useState<PurchaseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getPurchaseReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useExpenseReport() {
  const [data, setData] = useState<ExpenseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getExpenseReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useSupplierReport() {
  const [data, setData] = useState<SupplierReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await mockReportsService.getSupplierReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}
