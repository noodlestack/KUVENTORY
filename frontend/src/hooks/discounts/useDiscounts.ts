import { useState, useEffect, useCallback } from "react";
import { Discount, DiscountFormData } from "@/types/discounts";
import { discountService } from "@/services/discounts/discountService";
import { toast } from "sonner";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await discountService.getDiscounts();
      setDiscounts(data);
    } catch (error) {
      toast.error("Failed to fetch discounts");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchDiscounts);
  }, [fetchDiscounts]);

  const createDiscount = async (data: DiscountFormData) => {
    try {
      const newDiscount = await discountService.createDiscount(data);
      setDiscounts(prev => [...prev, newDiscount]);
      toast.success("Discount created successfully");
      return newDiscount;
    } catch (error) {
      toast.error("Failed to create discount");
      console.error(error);
      throw error;
    }
  };

  const updateDiscount = async (id: string, data: DiscountFormData) => {
    try {
      const updated = await discountService.updateDiscount(id, data);
      setDiscounts(prev => prev.map(d => d.id === id ? updated : d));
      toast.success("Discount updated successfully");
      return updated;
    } catch (error) {
      toast.error("Failed to update discount");
      console.error(error);
      throw error;
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      await discountService.deleteDiscount(id);
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success("Discount deleted successfully");
    } catch (error) {
      toast.error("Failed to delete discount");
      console.error(error);
      throw error;
    }
  };

  return { 
    discounts, 
    isLoading, 
    refresh: fetchDiscounts, 
    createDiscount, 
    updateDiscount,
    deleteDiscount
  };
}
