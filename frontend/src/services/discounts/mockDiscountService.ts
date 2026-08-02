import { Discount, DiscountFormData } from "@/types/discounts";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

const initialDiscounts: Discount[] = [
  {
    id: "disc1",
    name: "Senior Citizen",
    type: "Senior Citizen",
    percentage: 20,
    isActive: true,
    description: "Mandatory 20% discount for Senior Citizens",
    requirements: "Valid Senior Citizen ID",
  },
  {
    id: "disc2",
    name: "PWD",
    type: "PWD",
    percentage: 20,
    isActive: true,
    description: "Mandatory 20% discount for Persons with Disability",
    requirements: "Valid PWD ID",
  },
  {
    id: "disc3",
    name: "Employee Discount",
    type: "Employee",
    percentage: 10,
    isActive: true,
    description: "Standard discount for staff",
  },
];

let discounts = [...initialDiscounts];

export const mockDiscountService = {
  getDiscounts: async (): Promise<Discount[]> => {
    await delay(300);
    return [...discounts];
  },

  createDiscount: async (data: DiscountFormData): Promise<Discount> => {
    await delay(500);
    const newDiscount: Discount = {
      id: generateId("disc"),
      ...data,
    };
    discounts.push(newDiscount);
    return newDiscount;
  },

  updateDiscount: async (id: string, data: DiscountFormData): Promise<Discount> => {
    await delay(500);
    const index = discounts.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Discount not found");
    
    discounts[index] = { ...discounts[index], ...data };
    return discounts[index];
  },
  
  deleteDiscount: async (id: string): Promise<void> => {
    await delay(500);
    discounts = discounts.filter(d => d.id !== id);
  }
};
