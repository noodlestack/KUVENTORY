import { useState, useEffect, useCallback } from "react";
import { reportsService } from "@/services/reports/reportsService";
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
    const result = await reportsService.getAnalyticsSummary();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useSalesReport(filters?: { startDate?: Date; endDate?: Date; cashierId?: string }) {
  const [data, setData] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startIso = filters?.startDate?.toISOString();
  const endIso = filters?.endDate?.toISOString();
  const cashierId = filters?.cashierId;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getSalesReport({
      startDate: startIso ? new Date(startIso) : undefined,
      endDate: endIso ? new Date(endIso) : undefined,
      cashierId
    });
    setData(result);
    setIsLoading(false);
  }, [startIso, endIso, cashierId]);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useInventoryReport(filters?: { locationId?: string; categoryId?: string }) {
  const [data, setData] = useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locId = filters?.locationId;
  const catId = filters?.categoryId;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getInventoryReport({ locationId: locId, categoryId: catId });
    setData(result);
    setIsLoading(false);
  }, [locId, catId]);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function usePurchaseReport(filters?: { startDate?: Date; endDate?: Date; supplierId?: string }) {
  const [data, setData] = useState<PurchaseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startIso = filters?.startDate?.toISOString();
  const endIso = filters?.endDate?.toISOString();
  const supplierId = filters?.supplierId;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getPurchaseReport({
      startDate: startIso ? new Date(startIso) : undefined,
      endDate: endIso ? new Date(endIso) : undefined,
      supplierId
    });
    setData(result);
    setIsLoading(false);
  }, [startIso, endIso, supplierId]);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useExpenseReport(filters?: { startDate?: Date; endDate?: Date; categoryId?: string }) {
  const [data, setData] = useState<ExpenseReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startIso = filters?.startDate?.toISOString();
  const endIso = filters?.endDate?.toISOString();
  const categoryId = filters?.categoryId;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getExpenseReport({
      startDate: startIso ? new Date(startIso) : undefined,
      endDate: endIso ? new Date(endIso) : undefined,
      categoryId
    });
    setData(result);
    setIsLoading(false);
  }, [startIso, endIso, categoryId]);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useSupplierReport() {
  const [data, setData] = useState<SupplierReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getSupplierReport();
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}

export function useDiscountReport(filters?: { startDate?: Date; endDate?: Date }) {
  const [data, setData] = useState<import("@/types/reports").DiscountReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startIso = filters?.startDate?.toISOString();
  const endIso = filters?.endDate?.toISOString();

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const result = await reportsService.getDiscountReport({
      startDate: startIso ? new Date(startIso) : undefined,
      endDate: endIso ? new Date(endIso) : undefined,
    });
    setData(result);
    setIsLoading(false);
  }, [startIso, endIso]);

  useEffect(() => { queueMicrotask(fetch); }, [fetch]);
  return { data, isLoading, refresh: fetch };
}
