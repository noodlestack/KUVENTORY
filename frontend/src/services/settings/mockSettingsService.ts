import { 
  UserProfile, 
  UserAccount, 
  RestaurantSettings, 
  NotificationSettings, 
  ActivityLog, 
  UserPreferences 
} from "@/types/settings";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

// Mock Data State
let currentUser: UserProfile = {
  id: "usr_1",
  fullName: "Juan Dela Cruz",
  username: "admin_juan",
  email: "juan@kapeuno.com",
  phone: "0917-123-4567",
  role: "Administrator",
  status: "Active",
  lastLogin: new Date().toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
  preferences: {
    theme: "system",
    tableDensity: "comfortable",
    animations: true
  }
};

let restaurantSettings: RestaurantSettings = {
  name: "Kape Uno Bistro",
  address: "123 Coffee Street, Metro Manila, Philippines",
  contactNumber: "(02) 8123 4567",
  email: "hello@kapeuno.com",
  businessHours: "Mon - Sun: 7:00 AM - 10:00 PM",
  description: "A cozy neighborhood bistro serving premium coffee and pastries.",
};

let notificationSettings: NotificationSettings = {
  lowStockAlerts: true,
  systemAnnouncements: true,
  inventoryNotifications: false,
  purchaseNotifications: true,
  salesNotifications: false,
  expenseNotifications: true,
};

const usersList: UserAccount[] = [
  { ...currentUser },
  {
    id: "usr_2",
    fullName: "Maria Clara",
    username: "maria_cashier",
    email: "maria@kapeuno.com",
    role: "Cashier",
    status: "Active",
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "usr_3",
    fullName: "Pedro Penduko",
    username: "pedro_stock",
    email: "pedro@kapeuno.com",
    role: "Inventory Stocker",
    status: "Inactive",
    lastLogin: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  }
];

const activityLogs: ActivityLog[] = [
  {
    id: "log_1",
    date: new Date().toISOString(),
    user: "Juan Dela Cruz",
    module: "Settings",
    action: "Updated Preferences",
    description: "Changed theme to Dark Mode",
  },
  {
    id: "log_2",
    date: new Date(Date.now() - 3600000).toISOString(),
    user: "Maria Clara",
    module: "Sales",
    action: "Recorded Sale",
    description: "Recorded Sale #SAL-2026-005 for ₱1,250",
  },
  {
    id: "log_3",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    user: "Pedro Penduko",
    module: "Inventory",
    action: "Stock Adjusted",
    description: "Added 50 units to Arabica Beans",
  },
  {
    id: "log_4",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    user: "System",
    module: "Inventory",
    action: "Alert Triggered",
    description: "Paper Cups dropped below minimum threshold (12 left)",
  }
];

// Mock Service
export const mockSettingsService = {
  // Profile
  getProfile: async (): Promise<UserProfile> => {
    await delay(400);
    return { ...currentUser };
  },
  
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(600);
    currentUser = { ...currentUser, ...data };
    
    // Also update in usersList
    const idx = usersList.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      usersList[idx] = { ...currentUser };
    }
    
    return { ...currentUser };
  },

  updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    await delay(400);
    currentUser.preferences = { ...currentUser.preferences, ...data };
    return { ...currentUser.preferences };
  },

  // Restaurant Config
  getRestaurantSettings: async (): Promise<RestaurantSettings> => {
    await delay(400);
    return { ...restaurantSettings };
  },

  updateRestaurantSettings: async (data: Partial<RestaurantSettings>): Promise<RestaurantSettings> => {
    await delay(600);
    restaurantSettings = { ...restaurantSettings, ...data };
    return { ...restaurantSettings };
  },

  // Notifications
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    await delay(300);
    return { ...notificationSettings };
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    await delay(500);
    notificationSettings = { ...notificationSettings, ...data };
    return { ...notificationSettings };
  },

  // User Management
  getUsers: async (): Promise<UserAccount[]> => {
    await delay(500);
    return [...usersList];
  },

  createUser: async (data: Omit<UserAccount, "id" | "lastLogin" | "createdAt">): Promise<UserAccount> => {
    await delay(800);
    const newUser: UserAccount = {
      id: generateId("usr_"),
      ...data,
      lastLogin: "Never",
      createdAt: new Date().toISOString(),
    };
    usersList.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, data: Partial<UserAccount>): Promise<UserAccount> => {
    await delay(600);
    const index = usersList.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    usersList[index] = { ...usersList[index], ...data };
    return usersList[index];
  },

  // Activity Logs
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    await delay(600);
    return [...activityLogs];
  }
};
