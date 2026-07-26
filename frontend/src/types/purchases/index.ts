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
  totalCost: number;
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
  remarks?: string;
  status: PurchaseStatus;
}
