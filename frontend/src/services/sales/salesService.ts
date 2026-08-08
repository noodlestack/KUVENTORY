import { supabase } from '@/integrations/supabase/client';
import { Sale, SaleFormData, SalesSummaryData, SaleStatus } from "@/types/sales";

export const salesService = {
  getSales: async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, lines:sale_lines(*)');
    if (error) throw error;
    
    return (data || []).map(s => ({
      id: s.id,
      transactionNo: s.sale_number,
      saleDate: s.sale_date,
      items: (s.lines || []).map((l: any) => ({
        itemId: l.stock_item_id,
        itemName: 'Unknown',
        quantity: l.quantity,
        unitPrice: l.unit_price,
        subtotal: l.quantity * l.unit_price
      })),
      totalAmount: s.total_amount,
      discountAmount: s.discount_amount,
      netAmount: s.net_amount,
      status: s.status as SaleStatus,
      recordedBy: 'User'
    }));
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
    return null;
  }
};
