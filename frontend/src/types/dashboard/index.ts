export interface DashboardMetrics {
  todaySales: number;
  todayTransactions: number;
  currentProducts: number;
  currentInventoryItems: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  monthlyExpenses: number;
  activeSuppliers: number;
  
  salesTrend: number;
  transactionsTrend: number;
  expensesTrend: number;
}

export interface Activity {
  id: string;
  type: "Inventory" | "Supplier" | "Purchase" | "Sale" | "Expense";
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
