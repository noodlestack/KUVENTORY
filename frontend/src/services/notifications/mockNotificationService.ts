import { Notification } from "@/types/notifications";

// Mock database
let mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Low Stock Alert",
    message: "Coffee Beans are below minimum stock level.",
    type: "Inventory",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    isRead: false,
    actionUrl: "/inventory/low-stock"
  },
  {
    id: "notif-2",
    title: "Daily Sales Report",
    message: "Daily sales report generated for today.",
    type: "Sales",
    priority: "low",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    actionUrl: "/reports"
  },
  {
    id: "notif-3",
    title: "Purchase Order Received",
    message: "Purchase Order #00012 received successfully.",
    type: "Purchases",
    priority: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    actionUrl: "/purchases"
  },
  {
    id: "notif-4",
    title: "New Expense Added",
    message: "Electricity expense added to Finance.",
    type: "Expenses",
    priority: "low",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
  },
  {
    id: "notif-5",
    title: "Backup Completed",
    message: "System backup completed successfully.",
    type: "System",
    priority: "low",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isRead: true,
  },
  {
    id: "notif-6",
    title: "New Login Detected",
    message: "A new login was detected from an unrecognized IP.",
    type: "Security",
    priority: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isRead: false,
    actionUrl: "/settings/logs"
  },
];

export const mockNotificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...mockNotifications];
  },

  markAsRead: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockNotifications = mockNotifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
  },

  deleteNotification: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockNotifications = mockNotifications.filter(n => n.id !== id);
  },

  clearAll: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockNotifications = [];
  }
};
