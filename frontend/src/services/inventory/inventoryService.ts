import { supabase } from '@/integrations/supabase/client';
import {
  InventoryItem,
  InventoryFormData,
  StockMovement,
  StockAdjustment,
  StockAdjustmentFormData,
  InventoryHistoryEntry,
  InventoryStatus,
  MovementType
} from "@/types/inventory";

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('inventory_balances')
        .select(`
          id,
          quantity,
          location:inventory_locations (id, name),
          item:stock_items (
            id,
            stock_code,
            name,
            category:categories (id, name),
            unit:units_of_measure (code),
            tracking_type,
            minimum_stock_level,
            cost_price,
            selling_price,
            created_at,
            updated_at
          )
        `);
        
      if (error) throw error;
      
      return (data || []).map((row: any) => {
        const statusVal: InventoryStatus = 
          row.quantity === 0 ? 'Out of Stock' :
          row.quantity <= (row.item.minimum_stock_level || 0) ? 'Low Stock' : 'In Stock';

        return {
          id: row.item.id,
          itemCode: row.item.stock_code,
          name: row.item.name,
          categoryId: row.item.category?.id || '',
          categoryName: row.item.category?.name || 'Uncategorized',
          unit: row.item.unit?.code || 'pcs',
          supplier: 'Default Supplier', // Not directly tied to item in new schema
          beginningStock: 0,
          addedStock: 0,
          totalStock: row.quantity,
          morningSales: 0,
          afternoonSales: 0,
          endingStock: row.quantity,
          cost: row.item.cost_price || 0,
          sellingPrice: row.item.selling_price || 0,
          minStockLevel: row.item.minimum_stock_level || 0,
          storageLocation: row.location?.name || 'Main Warehouse',
          status: statusVal,
          lastUpdated: row.item.updated_at || new Date().toISOString(),
          createdAt: row.item.created_at || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return [];
    }
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
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          movement_type,
          quantity,
          reference_id,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        referenceNo: row.reference_id || '-',
        itemId: row.item?.id || '',
        itemName: row.item?.name || 'Unknown',
        itemCode: row.item?.stock_code || 'Unknown',
        type: (row.movement_type === 'IN' ? 'Stock In' : 
               row.movement_type === 'OUT' ? 'Stock Out' : 
               row.movement_type === 'ADJUSTMENT' ? 'Adjustment' : 
               row.movement_type === 'TRANSFER' ? 'Transfer' : 'Stock In') as MovementType,
        quantity: row.quantity,
        performedBy: row.user?.full_name || 'System',
        remarks: row.notes || '',
        date: row.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch movements:', error);
      return [];
    }
  },

  getAdjustments: async (): Promise<StockAdjustment[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          quantity,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `)
        .eq('movement_type', 'ADJUSTMENT')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        itemId: row.item?.id || '',
        itemName: row.item?.name || 'Unknown',
        currentQuantity: 0, // Would need to query historical balances to be accurate
        actualQuantity: row.quantity, // Just a rough proxy for UI display
        difference: row.quantity,
        reason: row.notes || 'Adjustment',
        adjustedBy: row.user?.full_name || 'System',
        remarks: row.notes || '',
        date: row.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch adjustments:', error);
      return [];
    }
  },

  getHistory: async (): Promise<InventoryHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          movement_type,
          quantity,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        itemId: row.item?.id || '',
        itemName: row.item?.name || 'Unknown',
        action: row.movement_type === 'ADJUSTMENT' ? 'Adjusted' : 'Restocked',
        performedBy: row.user?.full_name || 'System',
        details: `${row.quantity > 0 ? '+' : ''}${row.quantity} - ${row.notes || ''}`,
        date: row.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  },

  adjustStock: async (data: StockAdjustmentFormData): Promise<StockAdjustment> => {
    // Need to find location_id first
    const { data: locData } = await supabase.from('inventory_locations').select('id').limit(1).single();
    
    if (!locData) {
      throw new Error("No inventory location found to adjust stock against.");
    }

    const diff = data.actualQuantity; // UI usually passes the difference here based on mock service behavior
    
    const { error } = await supabase.rpc('inventory_adjust', {
      p_stock_item_id: data.itemId,
      p_location_id: locData.id,
      p_adjustment_type: diff >= 0 ? 'IN' : 'OUT',
      p_quantity: Math.abs(diff),
      p_reason: data.reason,
      p_notes: data.remarks
    });

    if (error) throw error;

    return {
      id: Math.random().toString(36).substr(2, 9),
      itemId: data.itemId,
      itemName: 'Adjusted Item',
      currentQuantity: 0,
      actualQuantity: data.actualQuantity,
      difference: diff,
      reason: data.reason,
      adjustedBy: 'Current User',
      remarks: data.remarks,
      date: new Date().toISOString()
    };
  }
};
