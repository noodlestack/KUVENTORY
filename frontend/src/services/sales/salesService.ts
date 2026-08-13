import { supabase } from '@/integrations/supabase/client';
import { Sale, SaleFormData, SalesSummaryData, SaleStatus } from "@/types/sales";

const mapSaleStatus = (dbStatus: string): SaleStatus => {
  switch (dbStatus?.toUpperCase()) {
    case 'COMPLETED': return 'Completed';
    case 'VOIDED': return 'Voided';
    case 'REFUNDED': return 'Refunded';
    default: return 'Completed';
  }
};

export const salesService = {
  getSales: async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, lines:sale_lines(*, stock_item:stock_items(name))');
    if (error) throw error;

    return ((data || []) as Record<string, unknown>[]).map((s) => ({
      id: s.id as string,
      transactionNo: s.sale_number as string,
      saleDate: s.sale_date as string,
      items: ((s.lines as Record<string, unknown>[]) || []).map((l) => ({
        itemId: l.stock_item_id as string,
        itemName: (l.stock_item as { name?: string } | null)?.name || 'Unknown',
        quantity: l.quantity as number,
        unitPrice: l.unit_price as number,
        subtotal: (l.quantity as number) * (l.unit_price as number),
      })),
      totalAmount: Number(s.subtotal || 0),
      discountAmount: Number(s.discount_amount || 0),
      netAmount: Number(s.total_amount || 0),
      status: mapSaleStatus(s.status as string),
      recordedBy: 'User',
    }));
  },

  createSale: async (formData: SaleFormData): Promise<Sale> => {
    const saleNumber = `INV-${Date.now()}`;
    
    // Get location
    const { data: locData } = await supabase.from('inventory_locations').select('id').limit(1).single();
    if (!locData) throw new Error("No inventory location found.");

    // Get active cash session — auto-open one if none exists so sales are never blocked
    let sessionData: { id: string } | null = null;
    const { data: existingSession } = await supabase
      .from('cash_sessions')
      .select('id')
      .eq('status', 'OPEN')
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      sessionData = existingSession;
    } else {
      // Auto-open a session for today
      const today = new Date().toISOString().split('T')[0];
      const { data: newSession, error: sessionError } = await supabase
        .from('cash_sessions')
        .insert({ business_date: today, opening_cash: 0, status: 'OPEN' })
        .select('id')
        .single();
      if (sessionError) throw new Error('Could not open cash session: ' + sessionError.message);
      sessionData = newSession;
    }

    const linesJson = formData.items.map(item => ({
      stock_item_id: item.itemId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }));

    let discountAmount = 0;
    let discountType = 'NONE';
    
    if (formData.hasDiscount && formData.discountId) {
      const { data: discount } = await supabase
        .from('discount_configs')
        .select('*')
        .eq('id', formData.discountId)
        .single();
        
      if (discount) {
        discountType = discount.discount_type || 'NONE';
        if (discount.discount_percentage) {
          const subtotal = formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
          discountAmount = subtotal * (discount.discount_percentage / 100);
        } else if (discount.fixed_discount_amount) {
          discountAmount = discount.fixed_discount_amount;
        }
      }
    }

    const { data: saleId, error } = await supabase.rpc('process_sale', {
      p_sale_number: saleNumber,
      p_location_id: locData.id,
      p_sale_date: formData.saleDate,
      p_discount_type: discountType,
      p_discount_amount: discountAmount,
      p_payment_method: 'CASH',
      p_cash_session_id: sessionData.id,
      p_notes: formData.remarks || null,
      p_lines_json: linesJson
    });

    if (error) throw error;

    return {
      id: saleId,
      transactionNo: saleNumber,
      saleDate: formData.saleDate,
      items: formData.items.map(i => ({...i, subtotal: (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)})),
      totalAmount: formData.items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)), 0),
      discountAmount: discountAmount,
      netAmount: formData.items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)), 0) - discountAmount,
      status: 'Completed',
      remarks: formData.remarks,
      recordedBy: 'Current User'
    };
  },

  getSalesSummary: async (): Promise<SalesSummaryData | null> => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: salesToday } = await supabase
      .from('sales')
      .select('subtotal, discount_amount, total_amount')
      .gte('sale_date', today);
      
    const todaySales = (salesToday || []).reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const grossIncome = (salesToday || []).reduce((sum, sale) => sum + (sale.subtotal || 0), 0);
    const totalDiscounts = (salesToday || []).reduce((sum, sale) => sum + (sale.discount_amount || 0), 0);
    const transactionsCount = salesToday?.length || 0;
    const averageSale = transactionsCount > 0 ? todaySales / transactionsCount : 0;
    const highestSale = salesToday?.length ? Math.max(...salesToday.map(s => s.total_amount || 0)) : 0;
    const lowestSale = salesToday?.length ? Math.min(...salesToday.map(s => s.total_amount || 0)) : 0;

    return {
      grossIncome,
      netIncome: todaySales,
      totalRefunds: 0,
      totalDiscounts,
      todaySales,
      transactionsCount,
      topSellingItem: 'N/A',
      averageSale,
      highestSale,
      lowestSale,
      chartData: []
    };
  }
};
