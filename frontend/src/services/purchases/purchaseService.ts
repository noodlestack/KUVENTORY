import { supabase } from '@/integrations/supabase/client';
import { Purchase, PurchaseFormData, PurchaseStatus } from "@/types/purchases";

const mapPurchaseStatus = (dbStatus: string): PurchaseStatus => {
  switch (dbStatus?.toUpperCase()) {
    case 'ORDERED': return 'Pending';
    case 'RECEIVED': return 'Delivered';
    case 'CANCELLED': return 'Cancelled';
    default: return 'Pending';
  }
};

export const purchaseService = {
  getPurchases: async (): Promise<Purchase[]> => {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, supplier:suppliers(name), lines:purchase_lines(*)');
    if (error) throw error;
    
    return (data || []).map(p => ({
      id: p.id,
      purchaseNo: p.purchase_number,
      purchaseDate: p.purchase_date,
      supplierId: p.supplier_id || '',
      supplierName: p.supplier?.name || '',
      items: (p.lines || []).map((l: any) => ({
        itemId: l.stock_item_id,
        itemName: 'Unknown',
        quantity: l.quantity,
        unitCost: l.unit_price,
        subtotal: l.quantity * l.unit_price
      })),
      subtotal: p.total_amount,
      discountAmount: p.discount_amount,
      netAmount: p.total_amount,
      totalCost: p.total_amount,
      status: mapPurchaseStatus(p.status),
      remarks: p.notes,
      recordedBy: 'User'
    }));
  },

  createPurchase: async (formData: PurchaseFormData, supplierName: string): Promise<Purchase> => {
    // Generate a temporary purchase number for the RPC (could also let DB generate it if trigger exists)
    const pNumber = `PO-${Date.now()}`;
    
    // Prepare lines JSON
    const linesJson = formData.items.map(item => ({
      stock_item_id: item.itemId,
      quantity: item.quantity,
      unit_cost: item.unitCost
    }));

    let discountAmount = 0;
    if (formData.hasDiscount && formData.discountId) {
      const { data: discount } = await supabase
        .from('discount_configs')
        .select('*')
        .eq('id', formData.discountId)
        .single();
        
      if (discount && discount.discount_percentage) {
        const subtotal = formData.items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
        discountAmount = subtotal * (discount.discount_percentage / 100);
      } else if (discount && discount.fixed_discount_amount) {
        discountAmount = discount.fixed_discount_amount;
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
  },

  receivePurchase: async (id: string): Promise<void> => {
    const { data: locData } = await supabase.from('inventory_locations').select('id').limit(1).single();
    if (!locData) throw new Error("No inventory location found to receive items.");
    
    // The RPC will update the status and handle inventory balances
    const { error } = await supabase.rpc('receive_purchase', {
      p_purchase_id: id,
      p_location_id: locData.id
    });
    
    if (error) throw error;
  },

  cancelPurchase: async (id: string): Promise<void> => {
    const { error } = await supabase.from('purchases').update({ status: 'CANCELLED' }).eq('id', id);
    if (error) throw error;
  }
};
