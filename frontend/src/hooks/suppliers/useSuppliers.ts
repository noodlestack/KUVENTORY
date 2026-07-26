import { useState, useEffect, useCallback } from "react";
import { Supplier, SupplierFormData } from "@/types/suppliers";
import { mockSupplierService } from "@/services/suppliers/mockSupplierService";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    const data = await mockSupplierService.getSuppliers();
    setSuppliers(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (data: SupplierFormData) => {
    const newSupplier = await mockSupplierService.createSupplier(data);
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = async (id: string, data: SupplierFormData) => {
    const updated = await mockSupplierService.updateSupplier(id, data);
    setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteSupplier = async (id: string) => {
    await mockSupplierService.deleteSupplier(id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  return { suppliers, isLoading, refresh: fetchSuppliers, createSupplier, updateSupplier, deleteSupplier };
}
