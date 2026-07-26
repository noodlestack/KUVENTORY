import { Purchase, PurchaseFormData } from "@/types/purchases";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

const purchases: Purchase[] = [
  {
    id: "pur1",
    purchaseNo: "PO-2026-001",
    purchaseDate: "2026-06-01T10:00:00Z",
    supplierId: "sup1",
    supplierName: "Global Beans Inc.",
    items: [
      { itemId: "inv1", itemName: "Arabica Coffee Beans", quantity: 50, unitCost: 10, subtotal: 500 }
    ],
    totalCost: 500,
    status: "Delivered",
    recordedBy: "John Doe",
    remarks: "Monthly restock"
  },
  {
    id: "pur2",
    purchaseNo: "PO-2026-002",
    purchaseDate: "2026-06-15T09:00:00Z",
    supplierId: "sup2",
    supplierName: "Local Farms Co.",
    items: [
      { itemId: "inv2", itemName: "Whole Milk", quantity: 100, unitCost: 1.5, subtotal: 150 },
      { itemId: "inv4", itemName: "Oat Milk", quantity: 20, unitCost: 2.5, subtotal: 50 }
    ],
    totalCost: 200,
    status: "Pending",
    recordedBy: "Jane Smith",
  }
];

export const mockPurchaseService = {
  getPurchases: async (): Promise<Purchase[]> => {
    await delay(600);
    return [...purchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  },

  createPurchase: async (data: PurchaseFormData, supplierName: string): Promise<Purchase> => {
    await delay(800);
    
    // Calculate subtotals and total
    const processedItems = data.items.map(item => ({
      ...item,
      subtotal: item.quantity * item.unitCost
    }));
    
    const totalCost = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newPurchase: Purchase = {
      id: generateId("pur"),
      purchaseNo: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseDate: data.purchaseDate,
      supplierId: data.supplierId,
      supplierName,
      items: processedItems,
      totalCost,
      status: data.status,
      remarks: data.remarks,
      recordedBy: "Current User",
    };

    purchases.unshift(newPurchase);
    return newPurchase;
  }
};
