export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface AnalyticsSummary {
  kpis: {
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    netIncome: number;
    activeInventoryItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalSuppliers: number;
    transactionCount: number;
  };
  salesTrend: ChartDataPoint[];
  expenseTrend: ChartDataPoint[];
  inventoryHealth: ChartDataPoint[];
}

export interface SalesReport {
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  yearlySales: number;
  topSellingProducts: ChartDataPoint[];
  salesTrend: ChartDataPoint[];
  averageSale: number;
  transactionCount: number;
}

export interface InventoryReport {
  totalValue: number;
  itemCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryByStatus: ChartDataPoint[];
  topStockedItems: ChartDataPoint[];
  inventoryMovement: ChartDataPoint[];
}

export interface PurchaseReport {
  monthlyPurchases: number;
  averagePurchase: number;
  topSuppliers: ChartDataPoint[];
  purchaseTrend: ChartDataPoint[];
}

export interface ExpenseReport {
  dailyExpenses: number;
  monthlyExpenses: number;
  highestExpense: number;
  lowestExpense: number;
  expenseCategories: ChartDataPoint[];
  expenseTrend: ChartDataPoint[];
}

export interface SupplierReport {
  activeSuppliers: number;
  totalSuppliers: number;
  supplierActivity: ChartDataPoint[];
  spendingBySupplier: ChartDataPoint[];
}
