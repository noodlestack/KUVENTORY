import { useState, useEffect, useCallback } from "react";
import { Supplier, SupplierFormData } from "@/types/suppliers";
import { supplierService } from "@/services/suppliers/supplierService";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    const data = await supplierService.getSuppliers();
    setSuppliers(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSuppliers);
  }, [fetchSuppliers]);

  const createSupplier = async (data: SupplierFormData) => {
    const newSupplier = await supplierService.createSupplier(data);
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = async (id: string, data: SupplierFormData) => {
    const updated = await supplierService.updateSupplier(id, data);
    setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteSupplier = async (id: string) => {
    await supplierService.deleteSupplier(id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  return { suppliers, isLoading, refresh: fetchSuppliers, createSupplier, updateSupplier, deleteSupplier };
}
