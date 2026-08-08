import { supabase } from '@/integrations/supabase/client';
import { CONFIGURED_DISCOUNTS } from '../discounts/discountService';
import { Sale, SaleFormData, SalesSummaryData, SaleStatus } from "@/types/sales";

export const salesService = {
  getSales: async (): Promise<Sale[]> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          sale_number,
          sale_date,
          status,
          subtotal,
          discount_amount,
          total_amount,
          notes,
          user:profiles(full_name),
          lines:sale_lines(
            stock_item:stock_items(id, name),
            quantity,
            unit_price,
            line_total
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        transactionNo: row.sale_number,
        saleDate: row.sale_date,
        items: (row.lines || []).map((line: any) => ({
          itemId: line.stock_item?.id || '',
          itemName: line.stock_item?.name || 'Unknown Item',
          quantity: line.quantity,
          unitPrice: line.unit_price,
          subtotal: line.line_total
        })),
        totalAmount: row.subtotal,
        discountAmount: row.discount_amount,
        netAmount: row.total_amount,
        status: (row.status === 'COMPLETED' ? 'Completed' : 
                 row.status === 'VOIDED' ? 'Voided' : 
                 row.status === 'REFUNDED' ? 'Refunded' : 'Completed') as SaleStatus,
        remarks: row.notes,
        recordedBy: row.user?.full_name || 'System'
      }));
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      return [];
    }
  },

  createSale: async (formData: SaleFormData): Promise<Sale> => {
    const saleNumber = `INV-${Date.now()}`;
    
    // Get location
    const { data: locData } = await supabase.from('inventory_locations').select('id').limit(1).single();
    if (!locData) throw new Error("No inventory location found.");

    // Get active cash session
    const { data: sessionData } = await supabase.from('cash_sessions').select('id').eq('status', 'OPEN').limit(1).single();
    if (!sessionData) throw new Error("No open cash session. Please open a cash session first.");

    const linesJson = formData.items.map(item => ({
      stock_item_id: item.itemId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }));

    let discountAmount = 0;
    let discountType = 'NONE';
    
    if (formData.hasDiscount && formData.discountId) {
      const discount = CONFIGURED_DISCOUNTS.find(d => d.id === formData.discountId);
      if (discount) {
        discountType = discount.type;
        if (discount.percentage) {
          const subtotal = formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
          discountAmount = subtotal * (discount.percentage / 100);
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
      items: formData.items.map(i => ({...i, subtotal: i.quantity * i.unitPrice})),
      totalAmount: formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
      discountAmount: discountAmount,
      netAmount: formData.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0) - discountAmount,
      status: 'Completed',
      remarks: formData.remarks,
      recordedBy: 'Current User'
    };
  },

  getSalesSummary: async (): Promise<SalesSummaryData | null> => {
    try {
      // Basic implementation - in real app, these would be RPCs or views
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount, discount_amount, status');
        
      if (error) throw error;
      
      const sales = data || [];
      const completedSales = sales.filter(s => s.status === 'COMPLETED');
      const grossIncome = completedSales.reduce((acc, s) => acc + (s.total_amount + s.discount_amount), 0);
      const netIncome = completedSales.reduce((acc, s) => acc + s.total_amount, 0);
      
      return {
        grossIncome,
        netIncome,
        totalRefunds: 0,
        totalDiscounts: completedSales.reduce((acc, s) => acc + s.discount_amount, 0),
        todaySales: netIncome,
        transactionsCount: completedSales.length,
        topSellingItem: 'Data pending',
        averageSale: completedSales.length ? netIncome / completedSales.length : 0,
        highestSale: Math.max(0, ...completedSales.map(s => s.total_amount)),
        lowestSale: Math.min(...completedSales.map(s => s.total_amount)),
        chartData: [] // Would need proper grouping
      };
    } catch (error) {
      console.error('Failed to fetch sales summary:', error);
      return null;
    }
  }
};
