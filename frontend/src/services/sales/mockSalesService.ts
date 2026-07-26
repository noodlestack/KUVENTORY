import { Sale, SaleFormData, SalesSummaryData } from "@/types/sales";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

const sales: Sale[] = [
  {
    id: "sale1",
    transactionNo: "TRX-2026-001",
    saleDate: new Date().toISOString(),
    customerName: "Walk-in Customer",
    items: [
      { itemId: "inv1", itemName: "Arabica Coffee Beans", quantity: 2, unitPrice: 15, subtotal: 30 },
      { itemId: "inv2", itemName: "Whole Milk", quantity: 1, unitPrice: 5, subtotal: 5 }
    ],
    totalAmount: 35,
    status: "Completed",
    recordedBy: "John Doe",
  },
  {
    id: "sale2",
    transactionNo: "TRX-2026-002",
    saleDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
    customerName: "Alice Smith",
    items: [
      { itemId: "inv4", itemName: "Oat Milk", quantity: 1, unitPrice: 6, subtotal: 6 }
    ],
    totalAmount: 6,
    status: "Completed",
    recordedBy: "Jane Smith",
  }
];

export const mockSalesService = {
  getSales: async (): Promise<Sale[]> => {
    await delay(600);
    return [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  },

  createSale: async (data: SaleFormData): Promise<Sale> => {
    await delay(800);
    
    const processedItems = data.items.map(item => ({
      ...item,
      subtotal: item.quantity * item.unitPrice
    }));
    
    const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newSale: Sale = {
      id: generateId("sale"),
      transactionNo: `TRX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      saleDate: data.saleDate,
      customerName: data.customerName || "Walk-in Customer",
      items: processedItems,
      totalAmount,
      status: data.status,
      remarks: data.remarks,
      recordedBy: "Current User",
    };

    sales.unshift(newSale);
    return newSale;
  },

  getSalesSummary: async (): Promise<SalesSummaryData> => {
    await delay(600);
    
    // Calculate simple metrics for the mock
    const today = new Date().toISOString().split("T")[0];
    const todaySalesItems = sales.filter(s => s.saleDate.startsWith(today) && s.status === "Completed");
    
    const todaySales = todaySalesItems.reduce((sum, s) => sum + s.totalAmount, 0);
    const transactionsCount = todaySalesItems.length;
    const allAmounts = todaySalesItems.map(s => s.totalAmount);
    const highestSale = allAmounts.length > 0 ? Math.max(...allAmounts) : 0;
    const lowestSale = allAmounts.length > 0 ? Math.min(...allAmounts) : 0;
    const averageSale = transactionsCount > 0 ? todaySales / transactionsCount : 0;

    // Mock Chart Data for past 7 days
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("en-US", { weekday: 'short' }),
        sales: Math.floor(Math.random() * 500) + 100 // Mock random daily sales
      };
    });

    return {
      todaySales,
      transactionsCount,
      bestSellingProduct: "Arabica Coffee Beans",
      averageSale,
      highestSale,
      lowestSale,
      chartData
    };
  }
};
