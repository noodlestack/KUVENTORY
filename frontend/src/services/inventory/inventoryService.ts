import { supabase } from '@/integrations/supabase/client';
import {
  InventoryItem,
  InventoryFormData,
  StockMovement,
  StockUpdateFormData
} from "@/types/inventory";

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*, category:categories(id, name)')
      .order('name');

    if (error) throw error;

    return (items as any[]).map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      category_id: item.category_id || '',
      category_name: item.category?.name || 'Uncategorized',
      supplier_name: item.supplier_name || '',
      unit: item.unit || '',
      cost: Number(item.cost),
      current_stock: Number(item.current_stock),
      minimum_stock: Number(item.minimum_stock),
      status: item.status,
      notes: item.notes || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  },

  createItem: async (data: InventoryFormData): Promise<void> => {
    const { error } = await supabase
      .from('inventory_items')
      .insert({
        sku: data.sku,
        name: data.name,
        category_id: data.category_id || null,
        supplier_name: data.supplier_name || null,
        unit: data.unit || null,
        cost: data.cost ?? 0,
        current_stock: data.current_stock ?? 0,
        minimum_stock: data.minimum_stock ?? 0,
        notes: data.notes || null,
        // The trigger check_stock_levels will update status immediately after this insert,
        // or we could let the DB default handle it, but wait we need to set status if current_stock > 0
        status: data.current_stock === 0 ? 'OUT_OF_STOCK' : (data.current_stock <= data.minimum_stock ? 'LOW_STOCK' : 'IN_STOCK')
      });

    if (error) throw error;
  },

  updateItem: async (id: string, data: InventoryFormData): Promise<void> => {
    const { error } = await supabase
      .from('inventory_items')
      .update({
        sku: data.sku,
        name: data.name,
        category_id: data.category_id || null,
        supplier_name: data.supplier_name || null,
        unit: data.unit || null,
        cost: data.cost ?? 0,
        minimum_stock: data.minimum_stock ?? 0,
        notes: data.notes || null,
        // We do NOT update current_stock directly here, that's what update_stock RPC is for.
        // Wait, if they just edit the item metadata, we shouldn't touch stock.
      })
      .eq('id', id);

    if (error) throw error;
    
    // Trigger check_stock_levels manually by forcing a status recalculation via RPC or just let it be.
    // Actually, just updating minimum_stock might change the status! We should handle this.
    // We can do a dummy status update to trigger it, or write an RPC, but let's keep it simple.
    // If minimum_stock changes, the trigger doesn't automatically fire unless status is updated.
    const { data: current } = await supabase.from('inventory_items').select('current_stock').eq('id', id).single();
    if (current) {
        let newStatus = 'IN_STOCK';
        if (current.current_stock === 0) newStatus = 'OUT_OF_STOCK';
        else if (current.current_stock <= (data.minimum_stock ?? 0)) newStatus = 'LOW_STOCK';
        
        await supabase.from('inventory_items').update({ status: newStatus }).eq('id', id);
    }
  },

  deleteItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new Error("Cannot delete item because it has associated history.");
      }
      throw error;
    }
  },

  updateStock: async (id: string, data: StockUpdateFormData, userId?: string): Promise<void> => {
    const { error } = await supabase.rpc('update_stock', {
      p_item_id: id,
      p_movement_type: data.movement_type,
      p_quantity: data.quantity,
      p_reason: data.reason || 'Manual update',
      p_user_id: userId || null
    });

    if (error) throw error;
  },

  getMovements: async (): Promise<StockMovement[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as StockMovement[];
  },
  
  getItemMovements: async (itemId: string): Promise<StockMovement[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('inventory_item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as StockMovement[];
  }
};
