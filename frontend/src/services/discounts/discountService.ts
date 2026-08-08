import { Discount, DiscountFormData } from "@/types/discounts";

export const CONFIGURED_DISCOUNTS: Discount[] = [
  { id: '1', name: 'Senior Citizen', type: 'SENIOR_CITIZEN' as any, percentage: 20, isActive: true },
  { id: '2', name: 'PWD', type: 'PWD' as any, percentage: 20, isActive: true },
  { id: '3', name: 'Employee', type: 'EMPLOYEE' as any, percentage: 10, isActive: true }
];

export const discountService = {
  getDiscounts: async (): Promise<Discount[]> => {
    return [...CONFIGURED_DISCOUNTS];
  },

  createDiscount: async (data: DiscountFormData): Promise<Discount> => {
    // In v4 this is static, but we return a simulated object to keep UI happy without errors
    const newDiscount: Discount = {
      id: Math.random().toString(36).substring(7),
      ...data
    };
    return newDiscount;
  },

  updateDiscount: async (id: string, data: DiscountFormData): Promise<Discount> => {
    return { id, ...data };
  },
  
  deleteDiscount: async (_id: string): Promise<void> => {
    // UI placeholder
  }
};
