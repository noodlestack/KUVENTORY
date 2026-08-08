import { supabase } from '@/integrations/supabase/client';
import { CONFIGURED_DISCOUNTS } from '../discounts/discountService';
import { Purchase, PurchaseFormData, PurchaseStatus } from "@/types/purchases";

export const purchaseService = {
  getPurchases: async (): Promise<Purchase[]> => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          purchase_number,
          purchase_date,
          status,
          subtotal,
          discount_amount,
          total_amount,
          notes,
          supplier:suppliers(id, name),
          lines:purchase_lines(
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
        purchaseNo: row.purchase_number,
        purchaseDate: row.purchase_date,
        supplierId: row.supplier?.id || '',
        supplierName: row.supplier?.name || 'Unknown Supplier',
        items: (row.lines || []).map((line: any) => ({
          itemId: line.stock_item?.id || '',
          itemName: line.stock_item?.name || 'Unknown Item',
          quantity: line.quantity,
          unitCost: line.unit_price,
          subtotal: line.line_total
        })),
        subtotal: row.subtotal,
        discountAmount: row.discount_amount,
        netAmount: row.total_amount,
        totalCost: row.total_amount,
        status: (row.status === 'ORDERED' ? 'Pending' : 
                 row.status === 'RECEIVED' ? 'Delivered' : 
                 row.status === 'CANCELLED' ? 'Cancelled' : 'Pending') as PurchaseStatus,
        remarks: row.notes,
        recordedBy: 'System' // Would need to fetch profile name
      }));
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      return [];
    }
  },

  createPurchase: async (formData: PurchaseFormData, supplierName: string): Promise<Purchase> => {
    // Generate a temporary purchase number for the RPC (could also let DB generate it if trigger exists)
    const pNumber = `PO-${Date.now()}`;
    
    // Prepare lines JSON
    const linesJson = formData.items.map(item => ({
      stock_item_id: item.itemId,
      quantity: item.quantity,
      unit_price: item.unitCost
    }));

    let discountAmount = 0;
    if (formData.hasDiscount && formData.discountId) {
      const discount = CONFIGURED_DISCOUNTS.find(d => d.id === formData.discountId);
      if (discount && discount.percentage) {
        const subtotal = formData.items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
        discountAmount = subtotal * (discount.percentage / 100);
      }
    }

    const { data: purchaseId, error } = await supabase.rpc('create_purchase', {
      p_purchase_number: pNumber,
      p_supplier_id: formData.supplierId,
      p_purchase_date: formData.purchaseDate,
      p_discount_amount: discountAmount,
      p_payment_method: 'CASH',
      p_notes: formData.remarks || null,
      p_lines_json: linesJson
    });

    if (error) throw error;

    // We can just fetch it right back to return the complete object
    const { data: newPurchase } = await supabase
      .from('purchases')
      .select('id, purchase_number, total_amount')
      .eq('id', purchaseId)
      .single();

    return {
      id: purchaseId,
      purchaseNo: newPurchase?.purchase_number || pNumber,
      purchaseDate: formData.purchaseDate,
      supplierId: formData.supplierId,
      supplierName: supplierName,
      items: formData.items.map(i => ({...i, subtotal: i.quantity * i.unitCost})),
      subtotal: formData.items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0),
      discountAmount: discountAmount,
      netAmount: newPurchase?.total_amount || 0,
      totalCost: newPurchase?.total_amount || 0,
      status: 'Pending',
      remarks: formData.remarks,
      recordedBy: 'Current User'
    };
  }
};
