export type NotificationType = "Inventory" | "Sales" | "Purchases" | "Expenses" | "System" | "Security" | "Account" | "General";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string; // ISO string
  isRead: boolean;
  actionUrl?: string;
}
