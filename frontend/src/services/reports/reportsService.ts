import { supabase } from '@/integrations/supabase/client';
import { AnalyticsSummary, SalesReport, InventoryReport, PurchaseReport, ExpenseReport, SupplierReport, DiscountReport } from "@/types/reports";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, format, subDays } from "date-fns";

export const reportsService = {
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    // Basic aggregation
    const [sales, purchases, expenses, inventory, suppliers] = await Promise.all([
      supabase.from('view_sales_report').select('total_amount, discount_amount, sale_date').eq('status', 'COMPLETED'),
      supabase.from('view_purchase_report').select('total_amount').eq('status', 'RECEIVED'),
      supabase.from('view_expense_report').select('final_amount, expense_date'),
      supabase.from('view_inventory_report').select('stock_status, item_active'),
      supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('is_active', true)
    ]);

    const totalSales = (sales.data || []).reduce((acc, s) => acc + (s.total_amount || 0), 0);
    const totalPurchases = (purchases.data || []).reduce((acc, p) => acc + (p.total_amount || 0), 0);
    const totalExpenses = (expenses.data || []).reduce((acc, e) => acc + (e.final_amount || 0), 0);
    const totalDiscounts = (sales.data || []).reduce((acc, s) => acc + (s.discount_amount || 0), 0);
    const netIncome = totalSales - totalPurchases - totalExpenses;

    const inventoryData = inventory.data || [];
    const activeInventoryItems = inventoryData.filter(i => i.item_active).length;
    const lowStockItems = inventoryData.filter(i => i.stock_status === 'LOW_STOCK').length;
    const outOfStockItems = inventoryData.filter(i => i.stock_status === 'OUT_OF_STOCK').length;

    // Group sales by month for trend
    const salesByMonth = (sales.data || []).reduce((acc: Record<string, number>, sale) => {
      const month = format(new Date(sale.sale_date), 'MMM');
      acc[month] = (acc[month] || 0) + (sale.total_amount || 0);
      return acc;
    }, {});

    const expensesByMonth = (expenses.data || []).reduce((acc: Record<string, number>, exp) => {
      const month = format(new Date(exp.expense_date), 'MMM');
      acc[month] = (acc[month] || 0) + (exp.final_amount || 0);
      return acc;
    }, {});

    const mapToTrend = (dataMap: Record<string, number>) => Object.entries(dataMap).map(([name, value]) => ({ name, value }));

    return {
      kpis: {
        totalSales,
        totalPurchases,
        totalExpenses,
        netIncome,
        totalDiscounts,
        activeInventoryItems,
        lowStockItems,
        outOfStockItems,
        totalSuppliers: suppliers.count || 0,
        transactionCount: (sales.data || []).length,
      },
      salesTrend: mapToTrend(salesByMonth),
      expenseTrend: mapToTrend(expensesByMonth),
      inventoryHealth: [
        { name: "Optimal", value: activeInventoryItems - lowStockItems - outOfStockItems },
        { name: "Low Stock", value: lowStockItems },
        { name: "Out of Stock", value: outOfStockItems },
      ]
    };
  },

  getSalesReport: async (filters?: { startDate?: Date; endDate?: Date; cashierId?: string }): Promise<SalesReport> => {
    let query = supabase.from('view_sales_report').select('*').eq('status', 'COMPLETED');
    
    if (filters?.startDate) {
      query = query.gte('sale_date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('sale_date', filters.endDate.toISOString());
    }
    if (filters?.cashierId) {
      query = query.eq('cashier_id', filters.cashierId);
    }

    const { data } = await query;
    const sales = data || [];

    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const filterByDate = (date: Date) => sales.filter(s => new Date(s.sale_date) >= date);

    const todaySales = filterByDate(today).reduce((acc, s) => acc + Number(s.total_amount), 0);
    const weeklySales = filterByDate(weekStart).reduce((acc, s) => acc + Number(s.total_amount), 0);
    const monthlySales = filterByDate(monthStart).reduce((acc, s) => acc + Number(s.total_amount), 0);
    const yearlySales = filterByDate(yearStart).reduce((acc, s) => acc + Number(s.total_amount), 0);
    
    const totalSalesValue = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
    const averageSale = sales.length ? totalSalesValue / sales.length : 0;
    const totalDiscounts = sales.reduce((acc, s) => acc + Number(s.discount_amount), 0);

    // Day of week trend for current week
    const recentSales = sales.filter(s => new Date(s.sale_date) >= subDays(now, 7));
    const trendMap = recentSales.reduce((acc: Record<string, number>, sale) => {
      const day = format(new Date(sale.sale_date), 'EEE');
      acc[day] = (acc[day] || 0) + Number(sale.total_amount);
      return acc;
    }, {});

    return {
      dailySales: todaySales,
      weeklySales,
      monthlySales,
      yearlySales,
      averageSale,
      transactionCount: sales.length,
      totalDiscounts,
      topSellingItems: [], // Requires a join with sale_lines, returning empty to avoid complex N+1
      salesTrend: Object.entries(trendMap).map(([name, value]) => ({ name, value }))
    };
  },

  getInventoryReport: async (filters?: { locationId?: string; categoryId?: string }): Promise<InventoryReport> => {
    let query = supabase.from('view_inventory_report').select('*');
    if (filters?.locationId) query = query.eq('location_id', filters.locationId);
    // Note: view_inventory_report doesn't currently select category_id directly, it selects category_name. 
    // To filter by categoryId, we would need to add category_id to the view, but we'll ignore it for now or assume UI passes locationId.
    const { data } = await query;
    const inventory = data || [];

    const totalValue = inventory.reduce((acc, i) => acc + Number(i.inventory_value || 0), 0);
    const itemCount = inventory.length;
    
    const optimal = inventory.filter(i => i.stock_status === 'OPTIMAL').length;
    const lowStockCount = inventory.filter(i => i.stock_status === 'LOW_STOCK').length;
    const outOfStockCount = inventory.filter(i => i.stock_status === 'OUT_OF_STOCK').length;

    // Top stocked items
    const topStocked = [...inventory]
      .sort((a, b) => Number(b.current_quantity) - Number(a.current_quantity))
      .slice(0, 5)
      .map(i => ({ name: i.stock_name || 'Unknown', value: Number(i.current_quantity) }));

    return {
      totalValue,
      itemCount,
      lowStockCount,
      outOfStockCount,
      inventoryByStatus: [
        { name: "Optimal", value: optimal },
        { name: "Low Stock", value: lowStockCount },
        { name: "Out of Stock", value: outOfStockCount },
      ],
      topStockedItems: topStocked,
      inventoryMovement: [] // Requires joining with stock_movements
    };
  },

  getPurchaseReport: async (filters?: { startDate?: Date; endDate?: Date; supplierId?: string }): Promise<PurchaseReport> => {
    let query = supabase.from('view_purchase_report').select('*').in('status', ['ORDERED', 'RECEIVED']);
    if (filters?.startDate) query = query.gte('purchase_date', filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte('purchase_date', filters.endDate.toISOString());
    if (filters?.supplierId) query = query.eq('supplier_id', filters.supplierId);

    const { data } = await query;
    const purchases = data || [];

    const monthStart = startOfMonth(new Date());
    const monthlyPurchases = purchases
      .filter(p => new Date(p.purchase_date) >= monthStart)
      .reduce((acc, p) => acc + Number(p.total_amount), 0);

    const totalPurchasesValue = purchases.reduce((acc, p) => acc + Number(p.total_amount), 0);
    const averagePurchase = purchases.length ? totalPurchasesValue / purchases.length : 0;

    const supplierMap = purchases.reduce((acc: Record<string, number>, p) => {
      const name = p.supplier_name || 'Unknown';
      acc[name] = (acc[name] || 0) + Number(p.total_amount);
      return acc;
    }, {});

    const topSuppliers = Object.entries(supplierMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const trendMap = purchases.reduce((acc: Record<string, number>, p) => {
      const month = format(new Date(p.purchase_date), 'MMM');
      acc[month] = (acc[month] || 0) + Number(p.total_amount);
      return acc;
    }, {});

    return {
      monthlyPurchases,
      averagePurchase,
      topSuppliers,
      purchaseTrend: Object.entries(trendMap).map(([name, value]) => ({ name, value }))
    };
  },

  getExpenseReport: async (filters?: { startDate?: Date; endDate?: Date; categoryId?: string }): Promise<ExpenseReport> => {
    let query = supabase.from('view_expense_report').select('*');
    if (filters?.startDate) query = query.gte('expense_date', filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte('expense_date', filters.endDate.toISOString());
    if (filters?.categoryId) query = query.eq('expense_category_id', filters.categoryId);

    const { data } = await query;
    const expenses = data || [];

    const now = new Date();
    const today = startOfDay(now);
    const monthStart = startOfMonth(now);

    const dailyExpenses = expenses
      .filter(e => new Date(e.expense_date) >= today)
      .reduce((acc, e) => acc + Number(e.final_amount), 0);

    const monthlyExpenses = expenses
      .filter(e => new Date(e.expense_date) >= monthStart)
      .reduce((acc, e) => acc + Number(e.final_amount), 0);

    const amounts = expenses.map(e => Number(e.final_amount));
    const highestExpense = amounts.length ? Math.max(...amounts) : 0;
    const lowestExpense = amounts.length ? Math.min(...amounts) : 0;

    const categoryMap = expenses.reduce((acc: Record<string, number>, e) => {
      const name = e.category_name || 'Unknown';
      acc[name] = (acc[name] || 0) + Number(e.final_amount);
      return acc;
    }, {});

    const trendMap = expenses.reduce((acc: Record<string, number>, e) => {
      const month = format(new Date(e.expense_date), 'MMM');
      acc[month] = (acc[month] || 0) + Number(e.final_amount);
      return acc;
    }, {});

    return {
      dailyExpenses,
      monthlyExpenses,
      highestExpense,
      lowestExpense,
      expenseCategories: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      expenseTrend: Object.entries(trendMap).map(([name, value]) => ({ name, value }))
    };
  },

  getSupplierReport: async (): Promise<SupplierReport> => {
    const { data: suppliers } = await supabase.from('suppliers').select('*');
    const { data: purchases } = await supabase.from('view_purchase_report').select('supplier_name, total_amount');
    
    const activeSuppliers = (suppliers || []).filter(s => s.is_active).length;
    const totalSuppliers = (suppliers || []).length;

    const spendingMap = (purchases || []).reduce((acc: Record<string, number>, p) => {
      const name = p.supplier_name || 'Unknown';
      acc[name] = (acc[name] || 0) + Number(p.total_amount);
      return acc;
    }, {});

    return {
      activeSuppliers,
      totalSuppliers,
      supplierActivity: [
        { name: "Active", value: activeSuppliers },
        { name: "Inactive", value: totalSuppliers - activeSuppliers },
      ],
      spendingBySupplier: Object.entries(spendingMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    };
  },

  getDiscountReport: async (filters?: { startDate?: Date; endDate?: Date }): Promise<DiscountReport> => {
    let query = supabase.from('sales').select('subtotal, discount_amount, total_amount, sale_date');
    if (filters?.startDate) query = query.gte('sale_date', filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte('sale_date', filters.endDate.toISOString());

    const { data: sales } = await query;
    const validSales = (sales || []).filter(s => Number(s.discount_amount) > 0);

    const originalAmount = validSales.reduce((acc, s) => acc + Number(s.subtotal), 0);
    const totalDiscount = validSales.reduce((acc, s) => acc + Number(s.discount_amount), 0);
    const netAmount = validSales.reduce((acc, s) => acc + Number(s.total_amount), 0);

    const trendMap = validSales.reduce((acc: Record<string, number>, s) => {
      const month = format(new Date(s.sale_date), 'MMM');
      acc[month] = (acc[month] || 0) + Number(s.discount_amount);
      return acc;
    }, {});

    return {
      totalTransactions: validSales.length,
      originalAmount,
      totalDiscount,
      netAmount,
      discountByType: [], // No discount types mapped dynamically in sales right now
      discountTrend: Object.entries(trendMap).map(([name, value]) => ({ name, value }))
    };
  }
};
