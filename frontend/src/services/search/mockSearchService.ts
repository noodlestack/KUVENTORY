import { SearchResult } from "@/types/search";

// Mock data representing pages and actions
const mockDatabase: SearchResult[] = [
  // Dashboard
  { id: "dash-1", title: "Overview Dashboard", description: "Main system overview and key metrics", module: "Dashboard", category: "Dashboard", href: "/", shortcut: "O" },
  
  // Inventory
  { id: "inv-1", title: "Inventory List", description: "View all current stock levels", module: "Inventory", category: "Inventory", href: "/inventory", shortcut: "I" },
  { id: "inv-2", title: "Low Stock Items", description: "View items requiring reorder", module: "Inventory", category: "Inventory", href: "/inventory/low-stock" },
  { id: "inv-3", title: "Supplies Directory", description: "Manage all supply variants", module: "Supplies", category: "Inventory", href: "/supplies", shortcut: "S" },
  { id: "inv-4", title: "Categories", description: "Manage item groupings", module: "Supplies", category: "Inventory", href: "/supplies/categories" },
  
  // Supply Chain
  { id: "sup-1", title: "Suppliers Directory", description: "Manage vendor information", module: "Suppliers", category: "Supply Chain", href: "/suppliers" },
  { id: "sup-2", title: "Purchase Orders", description: "View and create purchase orders", module: "Purchases", category: "Supply Chain", href: "/purchases" },
  { id: "sup-3", title: "Record Delivery", description: "Receive items from suppliers", module: "Purchases", category: "Supply Chain", href: "/purchases/receive" },
  
  // Finance
  { id: "fin-1", title: "Sales History", description: "View daily sales transactions", module: "Sales", category: "Finance", href: "/sales" },
  { id: "fin-2", title: "Record Sale", description: "Enter a new sales receipt", module: "Sales", category: "Finance", href: "/sales/new" },
  { id: "fin-3", title: "Expenses", description: "Manage operational costs", module: "Expenses", category: "Finance", href: "/expenses" },
  { id: "fin-4", title: "Financial Reports", description: "Generate accounting reports", module: "Reports", category: "Finance", href: "/reports" },
  
  // System
  { id: "sys-1", title: "System Settings", description: "Configure global system parameters", module: "Settings", category: "System", href: "/settings" },
  { id: "sys-2", title: "User Management", description: "Manage staff accounts and roles", module: "Users", category: "System", href: "/settings/users" },
  { id: "sys-3", title: "Activity Logs", description: "Audit trail of system actions", module: "Settings", category: "System", href: "/settings/logs" },
  { id: "sys-4", title: "My Profile", description: "Update your personal details", module: "Profile", category: "System", href: "/profile" },
];

export const mockSearchService = {
  search: async (query: string): Promise<SearchResult[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    
    return mockDatabase.filter((item) => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.module.toLowerCase().includes(lowerQuery)
    );
  },

  getRecentSearches: async (): Promise<SearchResult[]> => {
    // Return a few items simulating "recent"
    return [mockDatabase[0], mockDatabase[1], mockDatabase[12]];
  }
};
