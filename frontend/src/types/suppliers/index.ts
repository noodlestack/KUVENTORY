export type SupplierStatus = "Active" | "Inactive" | "Blacklisted";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: SupplierStatus;
  notes?: string;
  lastPurchaseDate?: string;
  totalPurchases: number;
  dateAdded: string;
  hasDefaultDiscount?: boolean;
  defaultDiscountId?: string;
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: SupplierStatus;
  notes?: string;
  hasDefaultDiscount?: boolean;
  defaultDiscountId?: string;
}
