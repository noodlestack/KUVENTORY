import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics, Activity, Notification, ChartDataPoint } from '@/types/dashboard';

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics | null> => {
    const today = new Date().toISOString().split('T')[0];

    // Use basic counts
    const [
      { count: activeSuppliers }, 
      { count: inventoryItems }, 
      { data: salesToday },
      { count: lowStockItems },
      { count: outOfStockItems }
    ] = await Promise.all([
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('sales').select('total_amount').gte('sale_date', today),
      supabase.from('inventory_balances').select('*', { count: 'exact', head: true }).gt('current_quantity', 0).lte('current_quantity', 10), // Assuming threshold 10
      supabase.from('inventory_balances').select('*', { count: 'exact', head: true }).lte('current_quantity', 0)
    ]);

    const todaySales = (salesToday || []).reduce((acc, s) => acc + (s.total_amount || 0), 0);

    return {
      todaySales: todaySales,
      todayTransactions: salesToday?.length || 0,
      currentSupplies: inventoryItems || 0,
      currentInventoryItems: inventoryItems || 0,
      lowStockItems: lowStockItems || 0,
      outOfStockItems: outOfStockItems || 0,
      monthlyExpenses: 0,
      activeSuppliers: activeSuppliers || 0,
      totalDiscountsToday: 0,
      discountedTransactions: 0,
      salesTrend: 0,
      transactionsTrend: 0,
      expensesTrend: 0,
      discountsTrend: 0
    };
  },

  getRecentActivities: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((log: any) => ({
      id: log.id,
      type: 'Inventory', 
      description: `${log.action} on ${log.entity_type}`,
      timestamp: log.created_at
    }));
  },

  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((n: any) => ({
      id: n.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: (n.notification_type === 'SYSTEM' ? 'Maintenance' : 'Alert') as any,
      title: n.title,
      message: n.message,
      timestamp: n.created_at,
      isRead: n.is_read
    }));
  },

  getSalesChartData: async (): Promise<ChartDataPoint[]> => {
    const today = new Date();
    const result: ChartDataPoint[] = [];
    
    // Fetch last 7 days individually
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', `${dateString}T00:00:00Z`)
        .lte('sale_date', `${dateString}T23:59:59Z`);
        
      const dailyTotal = (data || []).reduce((acc, s) => acc + (s.total_amount || 0), 0);
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result.push({
        name: i === 0 ? 'Today' : days[d.getDay()],
        value: dailyTotal
      });
    }
    
    return result;
  },

  getCategoryChartData: async (): Promise<ChartDataPoint[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('name');
      
    if (error || !data) return [];
    
    // For now, return categories with a default value of 0, 
    // real inventory sum by category requires joining stock_items and inventory_balances.
    return data.map(c => ({
      name: c.name,
      value: 1 // Placeholder until complex aggregate RPC is available
    }));
  },
};
