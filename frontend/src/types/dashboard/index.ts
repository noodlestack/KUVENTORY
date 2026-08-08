export interface DashboardMetrics {
  todaySales: number;
  todayTransactions: number;
  currentSupplies: number;
  currentInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  monthlyExpenses: number;
  activeSuppliers: number;
  
  totalDiscountsToday: number;
  discountedTransactions: number;
  
  salesTrend: number;
  transactionsTrend: number;
  expensesTrend: number;
  discountsTrend: number;
}

export interface Activity {
  id: string;
  type: "Inventory" | "Supplier" | "Purchase" | "Sale" | "Expense" | "Discount";
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: "Alert" | "Reminder" | "Warning" | "Maintenance";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
