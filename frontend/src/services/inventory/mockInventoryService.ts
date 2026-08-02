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

const calcEnding = (beg: number, add: number, morn: number, aft: number) => {
  return beg + add - morn - aft;
};

// Initial Mock Data
let inventory: InventoryItem[] = [
  { id: "inv1", itemCode: "RAW-001", name: "Arabica Coffee Beans", categoryId: "c11", categoryName: "Coffee Beans", unit: "kg", supplier: "Global Beans Inc.", beginningStock: 10, addedStock: 5, totalStock: 15, morningSales: 2, afternoonSales: 3, endingStock: 10, cost: 800, sellingPrice: 1200, minStockLevel: 5, maxStockLevel: 50, storageLocation: "Storage Room A", status: "In Stock", notes: "Premium roast", lastUpdated: "2026-06-10T08:00:00Z", createdAt: "2026-01-10T08:00:00Z" },
  { id: "inv2", itemCode: "RAW-002", name: "Whole Milk", categoryId: "c13", categoryName: "Milk", unit: "L", supplier: "Local Farms Co.", beginningStock: 20, addedStock: 0, totalStock: 20, morningSales: 15, afternoonSales: 4, endingStock: 1, cost: 90, sellingPrice: 150, expirationDate: "2026-06-20", minStockLevel: 10, maxStockLevel: 100, storageLocation: "Walk-in Fridge", status: "Low Stock", notes: "Use before expiry", lastUpdated: "2026-06-12T09:00:00Z", createdAt: "2026-01-12T09:00:00Z" },
  { id: "inv3", itemCode: "PKG-001", name: "Takeout Cups (12oz)", categoryId: "c15", categoryName: "Supplies", unit: "pcs", supplier: "Packit Supply", beginningStock: 0, addedStock: 0, totalStock: 0, morningSales: 0, afternoonSales: 0, endingStock: 0, cost: 2, sellingPrice: 5, minStockLevel: 500, maxStockLevel: 5000, storageLocation: "Storage Room B", status: "Out of Stock", lastUpdated: "2026-06-15T11:00:00Z", createdAt: "2026-01-15T11:00:00Z" },
];

const movements: StockMovement[] = [
  { id: "mov1", referenceNo: "PO-2026-001", itemId: "inv1", itemName: "Arabica Coffee Beans", itemCode: "RAW-001", type: "Stock In", quantity: 50, performedBy: "John Doe", remarks: "Monthly delivery", date: "2026-06-01T10:00:00Z" },
  { id: "mov2", referenceNo: "USE-2026-001", itemId: "inv1", itemName: "Arabica Coffee Beans", itemCode: "RAW-001", type: "Stock Out", quantity: -35, performedBy: "Jane Smith", remarks: "Used for operations", date: "2026-06-10T08:00:00Z" },
];

const adjustments: StockAdjustment[] = [];

const history: InventoryHistoryEntry[] = [
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
      beginningStock: data.beginningStock,
      addedStock: data.addedStock,
      totalStock: data.beginningStock + data.addedStock,
      morningSales: data.morningSales,
      afternoonSales: data.afternoonSales,
      endingStock: calcEnding(data.beginningStock, data.addedStock, data.morningSales, data.afternoonSales),
      cost: data.cost,
      sellingPrice: data.sellingPrice,
      expirationDate: data.expirationDate,
      minStockLevel: data.minStockLevel,
      storageLocation: data.storageLocation,
      status: data.status !== "Inactive" ? determineStatus(calcEnding(data.beginningStock, data.addedStock, data.morningSales, data.afternoonSales), data.minStockLevel) : "Inactive",
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
      totalStock: data.beginningStock + data.addedStock,
      endingStock: calcEnding(data.beginningStock, data.addedStock, data.morningSales, data.afternoonSales),
      status: data.status !== "Inactive" ? determineStatus(calcEnding(data.beginningStock, data.addedStock, data.morningSales, data.afternoonSales), data.minStockLevel) : "Inactive",
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
    const difference = data.actualQuantity - item.endingStock;

    const adjustment: StockAdjustment = {
      id: generateId("adj"),
      itemId: item.id,
      itemName: item.name,
      currentQuantity: item.endingStock,
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

    const updatedItem = {
      ...item,
      endingStock: data.actualQuantity,
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
      details: `Stock adjusted from ${item.endingStock} to ${data.actualQuantity}`,
      date: new Date().toISOString(),
    });

    return adjustment;
  }
};
