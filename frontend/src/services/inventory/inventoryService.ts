import { supabase } from '@/integrations/supabase/client';
import {
  InventoryItem,
  InventoryFormData,
  StockMovement,
  StockAdjustment,
  StockAdjustmentFormData,
  InventoryHistoryEntry,
  InventoryStatus
} from "@/types/inventory";

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*, category:categories(id, name), unit:units_of_measure(code), balances:inventory_balances(current_quantity)')
      .eq('is_active', true);
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      itemCode: item.stock_code,
      name: item.name,
      categoryId: item.category?.id || '',
      categoryName: item.category?.name || 'Uncategorized',
      unit: item.unit?.code || 'pcs',
      supplier: '',
      beginningStock: 0,
      addedStock: 0,
      totalStock: item.balances?.[0]?.current_quantity || 0,
      morningSales: 0,
      afternoonSales: 0,
      endingStock: item.balances?.[0]?.current_quantity || 0,
      cost: item.cost_price,
      sellingPrice: item.selling_price,
      minStockLevel: item.minimum_stock_level,
      storageLocation: '',
      status: (item.balances?.[0]?.current_quantity || 0) > 0 ? 'In Stock' as InventoryStatus : 'Out of Stock' as InventoryStatus,
      notes: '',
      lastUpdated: item.updated_at,
      createdAt: item.created_at
    }));
  },

  createItem: async (data: InventoryFormData, categoryName: string): Promise<InventoryItem> => {
    const { data: itemData, error: itemError } = await supabase
      .from('stock_items')
      .insert({
        name: data.name,
        stock_code: data.itemCode,
        category_id: data.categoryId,
        tracking_type: 'PORTION',
        minimum_stock_level: data.minStockLevel,
        cost_price: data.cost,
        selling_price: data.sellingPrice,
      })
      .select('*, category:categories(id, name), unit:units_of_measure(code)')
      .single();

    if (itemError) throw itemError;

    return {
      id: itemData.id,
      itemCode: itemData.stock_code,
      name: itemData.name,
      categoryId: itemData.category?.id || '',
      categoryName: itemData.category?.name || categoryName,
      unit: itemData.unit?.code || data.unit,
      supplier: data.supplier,
      beginningStock: 0,
      addedStock: 0,
      totalStock: 0,
      morningSales: 0,
      afternoonSales: 0,
      endingStock: 0,
      cost: itemData.cost_price,
      sellingPrice: itemData.selling_price,
      minStockLevel: itemData.minimum_stock_level,
      storageLocation: data.storageLocation,
      status: 'Out of Stock' as InventoryStatus,
      notes: data.notes,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  },

  updateItem: async (id: string, data: InventoryFormData, categoryName: string): Promise<InventoryItem> => {
    const { data: itemData, error } = await supabase
      .from('stock_items')
      .update({
        name: data.name,
        stock_code: data.itemCode,
        category_id: data.categoryId,
        minimum_stock_level: data.minStockLevel,
        cost_price: data.cost,
        selling_price: data.sellingPrice,
      })
      .eq('id', id)
      .select('*, category:categories(id, name), unit:units_of_measure(code)')
      .single();

    if (error) throw error;

    return {
      id: itemData.id,
      itemCode: itemData.stock_code,
      name: itemData.name,
      categoryId: itemData.category?.id || '',
      categoryName: itemData.category?.name || categoryName,
      unit: itemData.unit?.code || data.unit,
      supplier: data.supplier,
      beginningStock: 0,
      addedStock: 0,
      totalStock: 0,
      morningSales: 0,
      afternoonSales: 0,
      endingStock: 0,
      cost: itemData.cost_price,
      sellingPrice: itemData.selling_price,
      minStockLevel: itemData.minimum_stock_level,
      storageLocation: data.storageLocation,
      status: 'In Stock' as InventoryStatus,
      notes: data.notes,
      lastUpdated: new Date().toISOString(),
      createdAt: itemData.created_at || new Date().toISOString()
    };
  },

  getMovements: async (): Promise<StockMovement[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name, stock_code)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(m => ({
      id: m.id,
      referenceNo: m.reference_id || 'N/A',
      itemId: m.stock_item_id,
      itemName: m.item?.name || 'Unknown',
      itemCode: m.item?.stock_code || 'Unknown',
      type: m.movement_type as any,
      quantity: m.quantity,
      performedBy: 'System', // Could join profiles later
      remarks: m.notes || m.reason || '',
      date: m.created_at
    }));
  },

  getAdjustments: async (): Promise<StockAdjustment[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name)')
      .in('movement_type', ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'])
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(m => ({
      id: m.id,
      itemId: m.stock_item_id,
      itemName: m.item?.name || 'Unknown',
      currentQuantity: m.previous_quantity || 0,
      actualQuantity: m.new_quantity || 0,
      difference: m.quantity,
      reason: m.reason || 'No reason provided',
      adjustedBy: 'System',
      remarks: m.notes || '',
      date: m.created_at
    }));
  },

  getHistory: async (): Promise<InventoryHistoryEntry[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'stock_items')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    
    return (data || []).map(log => ({
      id: log.id,
      itemId: log.entity_id || '',
      itemName: 'Item ' + log.entity_id, 
      action: log.action as any,
      performedBy: 'User',
      details: JSON.stringify(log.new_values) || '',
      date: log.created_at
    }));
  },

  archiveItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('stock_items')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
  },

  adjustStock: async (data: StockAdjustmentFormData): Promise<StockAdjustment> => {
    // Need to find location_id first
    const { data: locData } = await supabase.from('inventory_locations').select('id').limit(1).single();
    
    if (!locData) {
      throw new Error("No inventory location found to adjust stock against.");
    }

    const diff = data.actualQuantity; // UI usually passes the difference here based on mock service behavior
    
    const { data: movementId, error } = await supabase.rpc('inventory_adjust', {
      p_stock_item_id: data.itemId,
      p_location_id: locData.id,
      p_adjustment_type: diff >= 0 ? 'IN' : 'OUT',
      p_quantity: Math.abs(diff),
      p_reason: data.reason,
      p_notes: data.remarks
    });

    if (error) throw error;
    
    // Fetch the actual movement created to return correct data
    const { data: movement } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name)')
      .eq('id', movementId)
      .single();

    return {
      id: movementId || Math.random().toString(36).substr(2, 9),
      itemId: data.itemId,
      itemName: movement?.item?.name || 'Adjusted Item',
      currentQuantity: movement?.previous_quantity || 0,
      actualQuantity: movement?.new_quantity || data.actualQuantity,
      difference: movement?.quantity || diff,
      reason: data.reason,
      adjustedBy: 'Current User',
      remarks: data.remarks,
      date: movement?.created_at || new Date().toISOString()
    };
  }
};
