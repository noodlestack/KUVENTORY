export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export type MovementType = "ADD" | "REMOVE" | "ADJUST";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name?: string; // Joined field
  supplier_name?: string;
  unit?: string;
  cost: number;
  current_stock: number;
  minimum_stock: number;
  status: InventoryStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryFormData {
  sku: string;
  name: string;
  category_id: string;
  supplier_name?: string;
  unit?: string;
  cost: number;
  current_stock: number;
  minimum_stock: number;
  notes?: string;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  created_by?: string;
  created_at: string;
}

export interface StockUpdateFormData {
  movement_type: MovementType;
  quantity: number;
  reason?: string;
}
