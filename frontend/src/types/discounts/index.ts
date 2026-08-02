export type DiscountType = "Senior Citizen" | "PWD" | "Employee" | "Promo" | "Other";

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  percentage: number; // e.g., 20 for 20%
  isActive: boolean;
  description?: string;
  requirements?: string; // e.g. "Requires ID"
}

export interface DiscountFormData {
  name: string;
  type: DiscountType;
  percentage: number;
  isActive: boolean;
  description?: string;
  requirements?: string;
}
