import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics, Activity, Notification, ChartDataPoint } from '@/types/dashboard';

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics | null> => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthStart = firstDayOfMonth.toISOString().split('T')[0];

    const [
      { count: activeSuppliers }, 
      { data: stockItems }, 
      { data: salesToday },
      { data: monthExpenses },
      { data: salesDiscounts }
    ] = await Promise.all([
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('stock_items').select('id, minimum_stock_level, balances:inventory_balances(current_quantity)').eq('is_active', true),
      supabase.from('sales').select('total_amount, discount_amount').gte('sale_date', today),
      supabase.from('expenses').select('final_amount').gte('expense_date', monthStart),
      supabase.from('sales').select('discount_amount').gte('sale_date', today).gt('discount_amount', 0)
    ]);

    let lowStockItems = 0;
    let outOfStockItems = 0;
    
    if (stockItems) {
      stockItems.forEach((item: any) => {
        const qty = item.balances?.[0]?.current_quantity || 0;
        const minLvl = item.minimum_stock_level || 10;
        if (qty <= 0) outOfStockItems++;
        else if (qty <= minLvl) lowStockItems++;
      });
    }

    const todaySales = (salesToday || []).reduce((acc, s) => acc + (s.total_amount || 0), 0);
    const todayDiscounts = (salesToday || []).reduce((acc, s) => acc + (s.discount_amount || 0), 0);
    const monthlyExpenses = (monthExpenses || []).reduce((acc, e) => acc + (e.final_amount || 0), 0);

    return {
      todaySales: todaySales,
      todayTransactions: salesToday?.length || 0,
      currentSupplies: stockItems?.length || 0,
      currentInventoryItems: stockItems?.length || 0,
      lowStockItems,
      outOfStockItems,
      monthlyExpenses,
      activeSuppliers: activeSuppliers || 0,
      totalDiscountsToday: todayDiscounts,
      discountedTransactions: salesDiscounts?.length || 0,
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
    
    return (data || []).map((log: any) => ({
      id: log.id,
      type: log.entity_type === 'stock_items' ? 'Inventory' : log.entity_type === 'sales' ? 'Sale' : log.entity_type === 'expenses' ? 'Expense' : 'Inventory', 
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
    
    return (data || []).map((n: any) => ({
      id: n.id,
      type: (n.type === 'SYSTEM' ? 'Maintenance' : 'Alert') as any,
      title: n.title,
      message: n.message,
      timestamp: n.created_at,
      isRead: n.is_read
    }));
  },

  getSalesChartData: async (): Promise<ChartDataPoint[]> => {
    const today = new Date();
    const result: ChartDataPoint[] = [];
    
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
    const { data: items, error } = await supabase
      .from('stock_items')
      .select('category:categories(name), balances:inventory_balances(current_quantity)');
      
    if (error || !items) return [];
    
    const categoryTotals: Record<string, number> = {};
    
    items.forEach((item: any) => {
      const categoryName = item.category?.name || 'Uncategorized';
      const quantity = item.balances?.[0]?.current_quantity || 0;
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += quantity;
    });
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter(data => data.value > 0)
      .sort((a, b) => b.value - a.value);
  },
};
