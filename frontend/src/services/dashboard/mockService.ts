import { DashboardMetrics, Activity, Notification, ChartDataPoint } from "@/types/dashboard";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    await delay(1200);
    return {
      todaySales: 12450.50,
      todayTransactions: 84,
      currentProducts: 342,
      currentInventoryItems: 12054,
      lowStockProducts: 12,
      outOfStockProducts: 3,
      monthlyExpenses: 45200.00,
      activeSuppliers: 18,
      salesTrend: 12.5,
      transactionsTrend: 8.2,
      expensesTrend: -2.4,
    };
  },

  getRecentActivities: async (): Promise<Activity[]> => {
    await delay(1500);
    return [
      { id: "1", type: "Sale", description: "Sale completed for Order #1042", timestamp: "10 mins ago" },
      { id: "2", type: "Inventory", description: "Restocked Arabica Coffee Beans (50kg)", timestamp: "1 hour ago" },
      { id: "3", type: "Expense", description: "Recorded utility bill payment", timestamp: "2 hours ago" },
      { id: "4", type: "Supplier", description: "Added new supplier: Fresh Farms Ltd", timestamp: "Yesterday" },
      { id: "5", type: "Purchase", description: "Purchase Order #88 received", timestamp: "Yesterday" },
    ];
  },

  getNotifications: async (): Promise<Notification[]> => {
    await delay(1000);
    return [
      { id: "1", type: "Alert", title: "Low Stock Alert", message: "Whole Milk is below minimum threshold.", timestamp: "10 mins ago", isRead: false },
      { id: "2", type: "Warning", title: "Expiring Products", message: "5 items are expiring this week.", timestamp: "2 hours ago", isRead: false },
      { id: "3", type: "Reminder", title: "Supplier Payment", message: "Payment due for Bakery Supplies Co.", timestamp: "1 day ago", isRead: true },
      { id: "4", type: "Maintenance", title: "System Update", message: "Scheduled maintenance tonight at 2 AM.", timestamp: "2 days ago", isRead: true },
    ];
  },

  getSalesChartData: async (): Promise<ChartDataPoint[]> => {
    await delay(800);
    return [
      { name: "Mon", value: 4000 },
      { name: "Tue", value: 3000 },
      { name: "Wed", value: 5000 },
      { name: "Thu", value: 4500 },
      { name: "Fri", value: 6000 },
      { name: "Sat", value: 8000 },
      { name: "Sun", value: 7500 },
    ];
  },
  
  getCategoryChartData: async (): Promise<ChartDataPoint[]> => {
    await delay(800);
    return [
      { name: "Coffee", value: 45 },
      { name: "Pastries", value: 25 },
      { name: "Meals", value: 20 },
      { name: "Merch", value: 10 },
    ];
  }
};
