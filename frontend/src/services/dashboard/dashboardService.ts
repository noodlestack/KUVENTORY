import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics, Activity, Notification, ChartDataPoint } from '@/types/dashboard';

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics | null> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Use basic counts
      const [{ count: activeSuppliers }, { count: inventoryItems }, { data: salesToday }] = await Promise.all([
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('stock_items').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('sales').select('total_amount').gte('sale_date', today)
      ]);

      const todaySales = (salesToday || []).reduce((acc, s) => acc + (s.total_amount || 0), 0);

      return {
        todaySales: todaySales,
        todayTransactions: salesToday?.length || 0,
        currentSupplies: inventoryItems || 0,
        currentInventoryItems: inventoryItems || 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        monthlyExpenses: 0,
        activeSuppliers: activeSuppliers || 0,
        totalDiscountsToday: 0,
        discountedTransactions: 0,
        salesTrend: 0,
        transactionsTrend: 0,
        expensesTrend: 0,
        discountsTrend: 0
      };
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  },

  getRecentActivities: async (): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      return (data || []).map((log: any) => ({
        id: log.id,
        type: 'Inventory', // Simplified
        description: `${log.action} on ${log.table_name}`,
        timestamp: log.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  },

  getNotifications: async (): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      return (data || []).map((n: any) => ({
        id: n.id,
        type: (n.notification_type === 'SYSTEM' ? 'Maintenance' : 'Alert') as any,
        title: n.title,
        message: n.message,
        timestamp: n.created_at,
        isRead: n.is_read
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  getSalesChartData: async (): Promise<ChartDataPoint[]> => {
    // Requires a daily grouped query, mocking for now to avoid complex RPC
    return [];
  },

  getCategoryChartData: async (): Promise<ChartDataPoint[]> => {
    return [];
  },
};
