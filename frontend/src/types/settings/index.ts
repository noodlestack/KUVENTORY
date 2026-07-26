export type Role = "Administrator" | "Cashier" | "Inventory Stocker";

export interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: Role;
  status: "Active" | "Inactive";
  lastLogin: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface UserProfile extends UserAccount {
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  tableDensity: "compact" | "comfortable";
  animations: boolean;
}

export interface RestaurantSettings {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  businessHours: string;
  description?: string;
  logoUrl?: string;
}

export interface NotificationSettings {
  lowStockAlerts: boolean;
  systemAnnouncements: boolean;
  inventoryNotifications: boolean;
  purchaseNotifications: boolean;
  salesNotifications: boolean;
  expenseNotifications: boolean;
}

export interface ActivityLog {
  id: string;
  date: string;
  user: string;
  module: string;
  action: string;
  description: string;
}
