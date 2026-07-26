import {
  InventoryItem,
  InventoryFormData,
  StockMovement,
  StockAdjustment,
  StockAdjustmentFormData,
  InventoryHistoryEntry,
  InventoryStatus,
} from "@/types/inventory";

// Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;
const determineStatus = (qty: number, min: number): InventoryStatus => {
  if (qty <= 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  return "In Stock";
};

// Initial Mock Data
let inventory: InventoryItem[] = [
  { id: "inv1", itemCode: "RAW-001", name: "Arabica Coffee Beans", categoryId: "c1", categoryName: "Raw Materials", unit: "kg", supplier: "Global Beans Inc.", currentQuantity: 15, minStockLevel: 20, maxStockLevel: 100, storageLocation: "Storage Room A", status: "Low Stock", notes: "Premium roast", lastUpdated: "2026-06-10T08:00:00Z", createdAt: "2026-01-10T08:00:00Z" },
  { id: "inv2", itemCode: "RAW-002", name: "Whole Milk", categoryId: "c2", categoryName: "Dairy", unit: "L", supplier: "Local Farms Co.", currentQuantity: 50, minStockLevel: 30, maxStockLevel: 200, storageLocation: "Walk-in Fridge", status: "In Stock", notes: "Use before expiry", lastUpdated: "2026-06-12T09:00:00Z", createdAt: "2026-01-12T09:00:00Z" },
  { id: "inv3", itemCode: "PKG-001", name: "Takeout Cups (12oz)", categoryId: "c3", categoryName: "Packaging", unit: "pcs", supplier: "Packit Supply", currentQuantity: 0, minStockLevel: 500, maxStockLevel: 5000, storageLocation: "Storage Room B", status: "Out of Stock", lastUpdated: "2026-06-15T11:00:00Z", createdAt: "2026-01-15T11:00:00Z" },
];

let movements: StockMovement[] = [
  { id: "mov1", referenceNo: "PO-2026-001", itemId: "inv1", itemName: "Arabica Coffee Beans", itemCode: "RAW-001", type: "Stock In", quantity: 50, performedBy: "John Doe", remarks: "Monthly delivery", date: "2026-06-01T10:00:00Z" },
  { id: "mov2", referenceNo: "USE-2026-001", itemId: "inv1", itemName: "Arabica Coffee Beans", itemCode: "RAW-001", type: "Stock Out", quantity: -35, performedBy: "Jane Smith", remarks: "Used for operations", date: "2026-06-10T08:00:00Z" },
];

let adjustments: StockAdjustment[] = [];

let history: InventoryHistoryEntry[] = [
  { id: "hist1", itemId: "inv1", itemName: "Arabica Coffee Beans", action: "Created", performedBy: "System Admin", details: "Initial setup", date: "2026-01-10T08:00:00Z" },
  { id: "hist2", itemId: "inv1", itemName: "Arabica Coffee Beans", action: "Restocked", performedBy: "John Doe", details: "Added 50 kg via PO-2026-001", date: "2026-06-01T10:00:00Z" },
];

export const mockInventoryService = {
  // Inventory CRUD
  getInventory: async (): Promise<InventoryItem[]> => {
    await delay(600);
    return [...inventory];
  },

  createItem: async (data: InventoryFormData, categoryName: string): Promise<InventoryItem> => {
    await delay(600);
    const newItem: InventoryItem = {
      id: generateId("inv"),
      itemCode: data.itemCode,
      name: data.name,
      categoryId: data.categoryId,
      categoryName,
      unit: data.unit,
      supplier: data.supplier,
      currentQuantity: data.currentQuantity,
      minStockLevel: data.minStockLevel,
      storageLocation: data.storageLocation,
      status: data.status !== "Inactive" ? determineStatus(data.currentQuantity, data.minStockLevel) : "Inactive",
      notes: data.notes,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    inventory = [...inventory, newItem];
    
    // Add history
    history.unshift({
      id: generateId("hist"),
      itemId: newItem.id,
      itemName: newItem.name,
      action: "Created",
      performedBy: "Current User",
      details: "Item created in system",
      date: new Date().toISOString(),
    });

    return newItem;
  },

  updateItem: async (id: string, data: InventoryFormData, categoryName: string): Promise<InventoryItem> => {
    await delay(600);
    const index = inventory.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item not found");

    const existing = inventory[index];
    const updatedItem: InventoryItem = {
      ...existing,
      ...data,
      categoryName,
      status: data.status !== "Inactive" ? determineStatus(data.currentQuantity, data.minStockLevel) : "Inactive",
      lastUpdated: new Date().toISOString(),
    };

    inventory = [
      ...inventory.slice(0, index),
      updatedItem,
      ...inventory.slice(index + 1),
    ];

    history.unshift({
      id: generateId("hist"),
      itemId: updatedItem.id,
      itemName: updatedItem.name,
      action: "Edited",
      performedBy: "Current User",
      details: "Item details updated",
      date: new Date().toISOString(),
    });

    return updatedItem;
  },

  // Movements & Adjustments
  getMovements: async (): Promise<StockMovement[]> => {
    await delay(600);
    return [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getAdjustments: async (): Promise<StockAdjustment[]> => {
    await delay(600);
    return [...adjustments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getHistory: async (): Promise<InventoryHistoryEntry[]> => {
    await delay(600);
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  adjustStock: async (data: StockAdjustmentFormData): Promise<StockAdjustment> => {
    await delay(800);
    const itemIndex = inventory.findIndex(i => i.id === data.itemId);
    if (itemIndex === -1) throw new Error("Item not found");

    const item = inventory[itemIndex];
    const difference = data.actualQuantity - item.currentQuantity;

    const adjustment: StockAdjustment = {
      id: generateId("adj"),
      itemId: item.id,
      itemName: item.name,
      currentQuantity: item.currentQuantity,
      actualQuantity: data.actualQuantity,
      difference,
      reason: data.reason,
      adjustedBy: "Current User",
      remarks: data.remarks,
      date: new Date().toISOString(),
    };
    adjustments.unshift(adjustment);

    // Create movement
    const movement: StockMovement = {
      id: generateId("mov"),
      referenceNo: `ADJ-${Date.now().toString().slice(-6)}`,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.itemCode,
      type: "Adjustment",
      quantity: difference,
      performedBy: "Current User",
      remarks: data.reason,
      date: new Date().toISOString(),
    };
    movements.unshift(movement);

    // Update Item
    const updatedItem = {
      ...item,
      currentQuantity: data.actualQuantity,
      status: item.status !== "Inactive" ? determineStatus(data.actualQuantity, item.minStockLevel) : item.status,
      lastUpdated: new Date().toISOString(),
    };
    inventory[itemIndex] = updatedItem;

    // Create History
    history.unshift({
      id: generateId("hist"),
      itemId: item.id,
      itemName: item.name,
      action: "Adjusted",
      performedBy: "Current User",
      details: `Stock adjusted from ${item.currentQuantity} to ${data.actualQuantity}`,
      date: new Date().toISOString(),
    });

    return adjustment;
  }
};
