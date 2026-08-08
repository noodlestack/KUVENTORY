import { SearchResult } from "@/types/search";
import { supabase } from '@/integrations/supabase/client';

// Static route data representing pages and actions
const staticRoutes: SearchResult[] = [
  // Dashboard
  { id: "dash-1", title: "Overview Dashboard", description: "Main system overview and key metrics", module: "Dashboard", category: "Dashboard", href: "/", shortcut: "O" },
  
  // Inventory
  { id: "inv-1", title: "Inventory List", description: "View all current stock levels", module: "Inventory", category: "Inventory", href: "/inventory", shortcut: "I" },
  { id: "inv-2", title: "Low Stock Items", description: "View items requiring reorder", module: "Inventory", category: "Inventory", href: "/inventory/low-stock" },
  { id: "inv-3", title: "Categories", description: "Manage item groupings", module: "Supplies", category: "Inventory", href: "/categories" },
  
  // Supply Chain
  { id: "sup-1", title: "Suppliers Directory", description: "Manage vendor information", module: "Suppliers", category: "Supply Chain", href: "/suppliers" },
  { id: "sup-2", title: "Purchase Orders", description: "View and create purchase orders", module: "Purchases", category: "Supply Chain", href: "/purchases" },
  
  // Finance
  { id: "fin-1", title: "Sales History", description: "View daily sales transactions", module: "Sales", category: "Finance", href: "/sales" },
  { id: "fin-3", title: "Expenses", description: "Manage operational costs", module: "Expenses", category: "Finance", href: "/expenses" },
  { id: "fin-4", title: "Financial Reports", description: "Generate accounting reports", module: "Reports", category: "Finance", href: "/reports" },
  
  // System
  { id: "sys-1", title: "System Settings", description: "Configure global system parameters", module: "Settings", category: "System", href: "/settings" },
];

export const searchService = {
  search: async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    
    // Search static routes
    const routeResults = staticRoutes.filter((item) => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.module.toLowerCase().includes(lowerQuery)
    );

    // Search real inventory items in Supabase
    const { data: items } = await supabase
      .from('stock_items')
      .select('id, name, stock_code')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(5);

    const dbResults: SearchResult[] = (items || []).map(item => ({
      id: `db-inv-${item.id}`,
      title: item.name,
      description: `Stock Item: ${item.stock_code}`,
      module: 'Inventory',
      category: 'Inventory',
      href: `/inventory` // Could link directly to details if supported
    }));

    return [...routeResults, ...dbResults];
  },

  getRecentSearches: async (): Promise<SearchResult[]> => {
    // Return a few static routes as recent
    return [staticRoutes[0], staticRoutes[1], staticRoutes[staticRoutes.length - 1]];
  }
};
