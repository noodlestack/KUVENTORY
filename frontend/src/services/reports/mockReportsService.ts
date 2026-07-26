import { AnalyticsSummary, SalesReport, InventoryReport, PurchaseReport, ExpenseReport, SupplierReport } from "@/types/reports";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockReportsService = {
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    await delay(600);
    return {
      kpis: {
        totalSales: 450000,
        totalPurchases: 180000,
        totalExpenses: 65000,
        netIncome: 205000,
        activeInventoryItems: 124,
        lowStockItems: 12,
        outOfStockItems: 3,
        totalSuppliers: 8,
        transactionCount: 845,
      },
      salesTrend: [
        { name: "Jan", value: 32000 },
        { name: "Feb", value: 41000 },
        { name: "Mar", value: 39000 },
        { name: "Apr", value: 52000 },
        { name: "May", value: 48000 },
        { name: "Jun", value: 61000 },
      ],
      expenseTrend: [
        { name: "Jan", value: 12000 },
        { name: "Feb", value: 14000 },
        { name: "Mar", value: 13000 },
        { name: "Apr", value: 18000 },
        { name: "May", value: 15000 },
        { name: "Jun", value: 21000 },
      ],
      inventoryHealth: [
        { name: "Optimal", value: 85 },
        { name: "Low Stock", value: 12 },
        { name: "Out of Stock", value: 3 },
      ]
    };
  },

  getSalesReport: async (): Promise<SalesReport> => {
    await delay(500);
    return {
      dailySales: 12500,
      weeklySales: 84000,
      monthlySales: 320000,
      yearlySales: 3850000,
      averageSale: 532,
      transactionCount: 24,
      topSellingProducts: [
        { name: "Arabica Beans", value: 45000 },
        { name: "Whole Milk", value: 32000 },
        { name: "Oat Milk", value: 28000 },
        { name: "Vanilla Syrup", value: 18000 },
        { name: "Paper Cups", value: 12000 },
      ],
      salesTrend: [
        { name: "Mon", value: 12000 },
        { name: "Tue", value: 14000 },
        { name: "Wed", value: 11000 },
        { name: "Thu", value: 16000 },
        { name: "Fri", value: 22000 },
        { name: "Sat", value: 28000 },
        { name: "Sun", value: 24000 },
      ]
    };
  },

  getInventoryReport: async (): Promise<InventoryReport> => {
    await delay(500);
    return {
      totalValue: 845000,
      itemCount: 124,
      lowStockCount: 12,
      outOfStockCount: 3,
      inventoryByStatus: [
        { name: "Optimal", value: 109 },
        { name: "Low Stock", value: 12 },
        { name: "Out of Stock", value: 3 },
      ],
      topStockedItems: [
        { name: "Paper Cups", value: 5000 },
        { name: "Stirrers", value: 3000 },
        { name: "Napkins", value: 2500 },
      ],
      inventoryMovement: [
        { name: "Week 1", value: 120 },
        { name: "Week 2", value: 140 },
        { name: "Week 3", value: 95 },
        { name: "Week 4", value: 180 },
      ]
    };
  },

  getPurchaseReport: async (): Promise<PurchaseReport> => {
    await delay(500);
    return {
      monthlyPurchases: 180000,
      averagePurchase: 12000,
      topSuppliers: [
        { name: "Bean Co.", value: 85000 },
        { name: "Dairy Farms", value: 42000 },
        { name: "Packaging Supplies", value: 28000 },
        { name: "Local Roasters", value: 25000 },
      ],
      purchaseTrend: [
        { name: "Week 1", value: 45000 },
        { name: "Week 2", value: 32000 },
        { name: "Week 3", value: 58000 },
        { name: "Week 4", value: 45000 },
      ]
    };
  },

  getExpenseReport: async (): Promise<ExpenseReport> => {
    await delay(500);
    return {
      dailyExpenses: 2500,
      monthlyExpenses: 65000,
      highestExpense: 15000,
      lowestExpense: 450,
      expenseCategories: [
        { name: "Rent", value: 35000 },
        { name: "Utilities", value: 15000 },
        { name: "Supplies", value: 8000 },
        { name: "Maintenance", value: 4500 },
        { name: "Marketing", value: 2500 },
      ],
      expenseTrend: [
        { name: "Week 1", value: 45000 },
        { name: "Week 2", value: 8000 },
        { name: "Week 3", value: 5000 },
        { name: "Week 4", value: 7000 },
      ]
    };
  },

  getSupplierReport: async (): Promise<SupplierReport> => {
    await delay(500);
    return {
      activeSuppliers: 6,
      totalSuppliers: 8,
      supplierActivity: [
        { name: "Active", value: 6 },
        { name: "Inactive", value: 2 },
      ],
      spendingBySupplier: [
        { name: "Bean Co.", value: 85000 },
        { name: "Dairy Farms", value: 42000 },
        { name: "Packaging Supplies", value: 28000 },
      ]
    };
  }
};
