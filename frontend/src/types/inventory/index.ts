export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Inactive";
export type MovementType = "Stock In" | "Stock Out" | "Adjustment" | "Return" | "Transfer";

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  supplier: string;
  beginningStock: number;
  addedStock: number;
  totalStock: number;
  morningSales: number;
  afternoonSales: number;
  endingStock: number;
  cost: number;
  sellingPrice: number;
  expirationDate?: string;
  minStockLevel: number;
  maxStockLevel?: number;
  storageLocation: string;
  status: InventoryStatus;
  notes?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface InventoryFormData {
  name: string;
  itemCode: string;
  categoryId: string;
  unit: string;
  supplier: string;
  beginningStock: number;
  addedStock: number;
  morningSales: number;
  afternoonSales: number;
  cost: number;
  sellingPrice: number;
  expirationDate?: string;
  minStockLevel: number;
  storageLocation: string;
  status: InventoryStatus;
  notes?: string;
}

export interface StockMovement {
  id: string;
  referenceNo: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  type: MovementType;
  quantity: number;
  performedBy: string;
  remarks: string;
  date: string;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  currentQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: string;
  adjustedBy: string;
  remarks?: string;
  date: string;
}

export interface StockAdjustmentFormData {
  itemId: string;
  actualQuantity: number;
  reason: string;
  remarks?: string;
}

export interface InventoryHistoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  action: "Created" | "Edited" | "Adjusted" | "Restocked" | "Archived";
  performedBy: string;
  details: string;
  date: string;
}
