export type DiscountType = "Senior Citizen" | "PWD" | "Delivery Driver" | "Employee" | "Promotional" | "Supplier" | "Vendor" | "Manual" | "Custom" | "None";

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  percentage?: number; 
  amount?: number;
  isActive: boolean;
  description?: string;
  requirements?: string; 
}

export interface DiscountFormData {
  name: string;
  type: DiscountType;
  percentage?: number;
  amount?: number;
  isActive: boolean;
  description?: string;
  requirements?: string;
}

export interface DiscountRecord {
  id: string;
  transactionId: string; // e.g. sale id
  type: DiscountType;
  percentage?: number;
  amount: number;
  originalAmount: number;
  netAmount: number;
  reason?: string;
  referenceNumber?: string;
  appliedBy: string;
  date: string;
  time: string;
  status: "Active" | "Voided";
}
