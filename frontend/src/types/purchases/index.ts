export type PurchaseStatus = "Pending" | "Delivered" | "Cancelled";

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  discountId?: string;
  discountAmount?: number;
  netAmount: number;
  totalCost: number; // Keep for backward compatibility/reporting mapping if needed, or define as netAmount
  status: PurchaseStatus;
  remarks?: string;
  recordedBy: string;
}

export interface PurchaseFormData {
  purchaseDate: string;
  supplierId: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
  }[];
  hasDiscount?: boolean;
  discountId?: string;
  remarks?: string;
  status: PurchaseStatus;
}
