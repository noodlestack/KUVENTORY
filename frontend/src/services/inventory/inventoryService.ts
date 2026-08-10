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

// Helper to resolve or create a record and return its ID
const resolveLookup = async (
  tableName: string,
  nameField: string,
  codeField: string,
  nameValue: string,
  codePrefix: string,
  extraFields: Record<string, string> = {}
): Promise<string | null> => {
  if (!nameValue || nameValue.trim() === '') return null;

  // Try to find existing record by name (case-insensitive)
  const { data } = await supabase
    .from(tableName as 'suppliers' | 'inventory_locations' | 'units_of_measure')
    .select('id')
    .ilike(nameField, nameValue.trim())
    .maybeSingle();

  if (data) return data.id;

  // Create new record if not found
  const code = `${codePrefix}-${Date.now().toString(36).toUpperCase()}`;
  const { data: newData, error } = await supabase
    .from(tableName as 'suppliers' | 'inventory_locations' | 'units_of_measure')
    .insert({
      [nameField]: nameValue.trim(),
      [codeField]: code,
      ...extraFields
    } as Record<string, string>)
    .select('id')
    .single();

  if (error) {
    console.warn(`resolveLookup: Could not create ${tableName} record for "${nameValue}":`, error.message);
    return null;
  }
  return newData?.id || null;
};

// Get or create an open daily inventory period
const getOpenDailyPeriod = async (): Promise<string | null> => {
  const { data: openPeriods } = await supabase
    .from('daily_inventory_periods')
    .select('id')
    .eq('status', 'OPEN')
    .limit(1);

  if (openPeriods && openPeriods.length > 0) {
    return openPeriods[0].id;
  }

  // Need a location to create a period
  const { data: loc } = await supabase
    .from('inventory_locations')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!loc) return null;

  const { data: newPeriod, error } = await supabase
    .from('daily_inventory_periods')
    .insert({
      business_date: new Date().toISOString().split('T')[0],
      location_id: loc.id,
      status: 'OPEN'
    })
    .select('id')
    .single();

  if (error) {
    console.error("Failed to create daily period:", error);
    return null;
  }
  return newPeriod?.id || null;
};

// Get or create the default inventory location
const getDefaultLocation = async (): Promise<string | null> => {
  const { data: loc } = await supabase
    .from('inventory_locations')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (loc) return loc.id;

  // Create default location
  const { data: newLoc, error } = await supabase
    .from('inventory_locations')
    .insert({ name: 'Main Storage', code: 'MAIN-001' })
    .select('id')
    .single();

  if (error) return null;
  return newLoc?.id || null;
};

// Map a raw DB item row to the InventoryItem frontend type
const mapItemRow = (
  item: Record<string, unknown>,
  line?: Record<string, unknown> | null
): InventoryItem => {
  const balances = item.balances as Array<{ current_quantity: number }> | null;
  const currentQty = balances?.[0]?.current_quantity ?? 0;
  const category = item.category as { id?: string; name?: string } | null;
  const unit = item.unit as { code?: string } | null;
  const supplier = item.supplier as { name?: string } | null;
  const location = item.location as { name?: string } | null;

  const beginningStock = Number(line?.beginning_stock ?? 0);
  const addedStock = Number(line?.added_stock ?? 0);
  const morningSales = Number(line?.am_sales ?? 0);
  const afternoonSales = Number(line?.pm_sales ?? 0);
  const totalStock = beginningStock + addedStock;
  const endingStock = currentQty;

  let status: InventoryStatus = 'In Stock';
  const minLevel = Number(item.minimum_stock_level ?? 0);
  const effectiveQty = currentQty;
  
  if (effectiveQty <= 0) status = 'Out of Stock';
  else if (minLevel > 0 && effectiveQty <= minLevel) status = 'Low Stock';

  return {
    id: item.id as string,
    itemCode: item.stock_code as string,
    name: item.name as string,
    categoryId: category?.id || '',
    categoryName: category?.name || 'Uncategorized',
    unit: unit?.code || '',
    supplier: supplier?.name || '',
    beginningStock,
    addedStock,
    totalStock: line ? totalStock : currentQty,
    morningSales,
    afternoonSales,
    endingStock: line ? endingStock : currentQty,
    cost: Number(item.cost_price ?? 0),
    sellingPrice: Number(item.selling_price ?? 0),
    minStockLevel: minLevel,
    storageLocation: location?.name || '',
    status,
    notes: (item.notes as string) || '',
    lastUpdated: item.updated_at as string,
    createdAt: item.created_at as string,
  };
};

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const { data: items, error } = await supabase
      .from('stock_items')
      .select(
        '*, category:categories(id, name), unit:units_of_measure(code), ' +
        'balances:inventory_balances(current_quantity), ' +
        'supplier:suppliers(name), location:inventory_locations(name)'
      )
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    const periodId = await getOpenDailyPeriod();
    let dailyLines: Record<string, unknown>[] = [];

    if (periodId) {
      const { data: lines } = await supabase
        .from('daily_inventory_lines')
        .select('*')
        .eq('daily_inventory_period_id', periodId);
      dailyLines = (lines as Record<string, unknown>[]) || [];
    }

    return (items as unknown as Record<string, unknown>[]).map(item => {
      const line = dailyLines.find(l => l.stock_item_id === item.id) as Record<string, unknown> | undefined;
      return mapItemRow(item, line || null);
    });
  },

  getArchivedItems: async (): Promise<InventoryItem[]> => {
    const { data: items, error } = await supabase
      .from('stock_items')
      .select(
        '*, category:categories(id, name), unit:units_of_measure(code), ' +
        'balances:inventory_balances(current_quantity), ' +
        'supplier:suppliers(name), location:inventory_locations(name)'
      )
      .eq('is_active', false)
      .order('archived_at', { ascending: false });

    if (error) throw error;

    return (items as unknown as Record<string, unknown>[]).map(item => {
      const mapped = mapItemRow(item, null);
      mapped.status = 'Inactive';
      return mapped;
    });
  },

  createItem: async (data: InventoryFormData, _categoryName: string): Promise<InventoryItem> => {
    const supplierId = await resolveLookup('suppliers', 'name', 'supplier_code', data.supplier, 'SUP');
    const locationId = await resolveLookup('inventory_locations', 'name', 'code', data.storageLocation, 'LOC');
    const unitId = await resolveLookup('units_of_measure', 'code', 'name', data.unit, 'UOM', { name: data.unit });

    const { data: itemData, error: itemError } = await supabase
      .from('stock_items')
      .insert({
        name: data.name,
        stock_code: data.itemCode,
        category_id: data.categoryId || null,
        tracking_type: 'PORTION',
        minimum_stock_level: data.minStockLevel ?? 0,
        cost_price: data.cost ?? 0,
        selling_price: data.sellingPrice ?? 0,
        notes: data.notes || null,
        supplier_id: supplierId || null,
        location_id: locationId || null,
        unit_of_measure_id: unitId || null,
      })
      .select('*, category:categories(id, name), unit:units_of_measure(code), supplier:suppliers(name), location:inventory_locations(name)')
      .single();

    if (itemError) throw itemError;

    // Set beginning stock via daily inventory line
    const periodId = await getOpenDailyPeriod();
    if (periodId) {
      const totalDailySales = Number(data.morningSales) + Number(data.afternoonSales);
      const totalStock = Number(data.beginningStock) + Number(data.addedStock);
      const calculatedEnding = Math.max(0, totalStock - totalDailySales);

      await supabase.from('daily_inventory_lines').insert({
        daily_inventory_period_id: periodId,
        stock_item_id: (itemData as Record<string, unknown>).id,
        beginning_stock: data.beginningStock ?? 0,
        added_stock: data.addedStock ?? 0,
        total_stock: totalStock,
        am_sales: data.morningSales ?? 0,
        pm_sales: data.afternoonSales ?? 0,
        total_daily_sales: totalDailySales,
        calculated_ending_stock: calculatedEnding,
      });
    }

    // Create initial inventory balance 
    const initialQty = Number(data.beginningStock) + Number(data.addedStock);
    const defaultLocId = locationId || await getDefaultLocation();
    
    if (defaultLocId) {
      if (initialQty > 0) {
        await supabase.rpc('inventory_adjust', {
          p_stock_item_id: (itemData as Record<string, unknown>).id,
          p_location_id: defaultLocId,
          p_adjustment_type: 'IN',
          p_quantity: initialQty,
          p_reason: 'Initial stock on item creation',
          p_notes: `Beginning: ${data.beginningStock}, Added: ${data.addedStock}`,
        });
      } else {
        await supabase.from('inventory_balances').insert({
          stock_item_id: (itemData as Record<string, unknown>).id,
          location_id: defaultLocId,
          current_quantity: 0
        });
      }
    }

    return mapItemRow(
      {
        ...(itemData as Record<string, unknown>),
        balances: [{ current_quantity: initialQty }],
      },
      {
        beginning_stock: data.beginningStock ?? 0,
        added_stock: data.addedStock ?? 0,
        am_sales: data.morningSales ?? 0,
        pm_sales: data.afternoonSales ?? 0,
      }
    );
  },

  updateItem: async (id: string, data: InventoryFormData, _categoryName: string): Promise<InventoryItem> => {
    const supplierId = await resolveLookup('suppliers', 'name', 'supplier_code', data.supplier, 'SUP');
    const locationId = await resolveLookup('inventory_locations', 'name', 'code', data.storageLocation, 'LOC');
    const unitId = await resolveLookup('units_of_measure', 'code', 'name', data.unit, 'UOM', { name: data.unit });

    const { data: itemData, error } = await supabase
      .from('stock_items')
      .update({
        name: data.name,
        stock_code: data.itemCode,
        category_id: data.categoryId || null,
        minimum_stock_level: data.minStockLevel ?? 0,
        cost_price: data.cost ?? 0,
        selling_price: data.sellingPrice ?? 0,
        notes: data.notes || null,
        supplier_id: supplierId || null,
        location_id: locationId || null,
        unit_of_measure_id: unitId || null,
      })
      .eq('id', id)
      .select('*, category:categories(id, name), unit:units_of_measure(code), balances:inventory_balances(current_quantity), supplier:suppliers(name), location:inventory_locations(name)')
      .single();

    if (error) throw error;

    // Update daily inventory line
    const periodId = await getOpenDailyPeriod();
    if (periodId) {
      const totalDailySales = Number(data.morningSales) + Number(data.afternoonSales);
      const totalStock = Number(data.beginningStock) + Number(data.addedStock);
      const calculatedEnding = Math.max(0, totalStock - totalDailySales);

      const { data: existingLine } = await supabase
        .from('daily_inventory_lines')
        .select('id, added_stock')
        .eq('daily_inventory_period_id', periodId)
        .eq('stock_item_id', id)
        .maybeSingle();

      const linePayload = {
        beginning_stock: data.beginningStock ?? 0,
        added_stock: data.addedStock ?? 0,
        total_stock: totalStock,
        am_sales: data.morningSales ?? 0,
        pm_sales: data.afternoonSales ?? 0,
        total_daily_sales: totalDailySales,
        calculated_ending_stock: calculatedEnding,
      };

      if (existingLine) {
        await supabase.from('daily_inventory_lines').update(linePayload).eq('id', existingLine.id);
      } else {
        await supabase.from('daily_inventory_lines').insert({
          daily_inventory_period_id: periodId,
          stock_item_id: id,
          ...linePayload,
        });
      }

      // Sync actual balance
      const targetLocId = locationId || await getDefaultLocation();
      if (targetLocId) {
        const { data: balanceData } = await supabase
          .from('inventory_balances')
          .select('id')
          .eq('stock_item_id', id)
          .eq('location_id', targetLocId)
          .maybeSingle();

        if (balanceData) {
          await supabase.from('inventory_balances').update({ current_quantity: calculatedEnding }).eq('id', balanceData.id);
        } else {
          await supabase.from('inventory_balances').insert({
            stock_item_id: id,
            location_id: targetLocId,
            current_quantity: calculatedEnding
          });
        }
      }
    }

    return mapItemRow(itemData as Record<string, unknown>, {
      beginning_stock: data.beginningStock ?? 0,
      added_stock: data.addedStock ?? 0,
      am_sales: data.morningSales ?? 0,
      pm_sales: data.afternoonSales ?? 0,
    });
  },

  getMovements: async (): Promise<StockMovement[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name, stock_code)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    return ((data || []) as Record<string, unknown>[]).map(m => {
      const item = m.item as { name?: string; stock_code?: string } | null;
      return {
        id: m.id as string,
        referenceNo: (m.reference_id as string) || 'N/A',
        itemId: m.stock_item_id as string,
        itemName: item?.name || 'Unknown',
        itemCode: item?.stock_code || 'Unknown',
        type: (m.movement_type as string).replace(/_/g, ' ') as StockMovement['type'],
        quantity: m.quantity as number,
        performedBy: 'User',
        remarks: ((m.notes as string) || (m.reason as string) || ''),
        date: m.created_at as string,
      };
    });
  },

  getAdjustments: async (): Promise<StockAdjustment[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name)')
      .in('movement_type', ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return ((data || []) as Record<string, unknown>[]).map(m => {
      const item = m.item as { name?: string } | null;
      return {
        id: m.id as string,
        itemId: m.stock_item_id as string,
        itemName: item?.name || 'Unknown',
        currentQuantity: (m.previous_quantity as number) || 0,
        actualQuantity: (m.new_quantity as number) || 0,
        difference: m.quantity as number,
        reason: (m.reason as string) || 'No reason provided',
        adjustedBy: 'User',
        remarks: (m.notes as string) || '',
        date: m.created_at as string,
      };
    });
  },

  getHistory: async (): Promise<InventoryHistoryEntry[]> => {
    // Use stock_movements for richer history with actual item names
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name, stock_code)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const actionMap: Record<string, InventoryHistoryEntry['action']> = {
      OPENING_BALANCE: 'Restocked',
      MANUAL_RECEIPT: 'Restocked',
      PURCHASE_IN: 'Restocked',
      ADJUSTMENT_IN: 'Adjusted',
      ADJUSTMENT_OUT: 'Adjusted',
      SALE_OUT: 'Adjusted',
      SALE_OUT_AM: 'Adjusted',
      SALE_OUT_PM: 'Adjusted',
      TRANSFER_IN: 'Edited',
      TRANSFER_OUT: 'Edited',
      DAMAGE: 'Adjusted',
      EXPIRY: 'Adjusted',
      LOSS: 'Adjusted',
      CORRECTION: 'Adjusted',
    };

    return ((data || []) as Record<string, unknown>[]).map(m => {
      const item = m.item as { name?: string; stock_code?: string } | null;
      const movType = m.movement_type as string;
      return {
        id: m.id as string,
        itemId: m.stock_item_id as string,
        itemName: item?.name || `Item (${String(m.stock_item_id).slice(0, 8)}...)`,
        action: actionMap[movType] || 'Edited',
        performedBy: 'User',
        details: `${movType.replace(/_/g, ' ')}: ${m.quantity} units. Before: ${m.previous_quantity ?? 0} → After: ${m.new_quantity ?? 0}${m.reason ? '. Reason: ' + m.reason : ''}`,
        date: m.created_at as string,
      };
    });
  },

  archiveItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('stock_items')
      .update({ is_active: false, archived_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  deleteItem: async (id: string): Promise<void> => {
    // Check for dependent records
    const { count: movesCount } = await supabase
      .from('stock_movements')
      .select('*', { count: 'exact', head: true })
      .eq('stock_item_id', id);

    if (movesCount && movesCount > 0) {
      throw new Error("Cannot delete item because it has existing stock movements. Please archive it instead.");
    }

    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new Error("Cannot delete item because it is referenced in other records. Please archive it instead.");
      }
      throw error;
    }
  },

  restoreItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('stock_items')
      .update({ is_active: true, archived_at: null })
      .eq('id', id);

    if (error) throw error;
  },

  adjustStock: async (data: StockAdjustmentFormData): Promise<StockAdjustment> => {
    const locId = await getDefaultLocation();
    if (!locId) throw new Error('No inventory location found. Please create one in Settings.');

    const qty = Math.abs(data.actualQuantity);
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');

    const { data: movementId, error } = await supabase.rpc('inventory_adjust', {
      p_stock_item_id: data.itemId,
      p_location_id: locId,
      p_adjustment_type: data.actualQuantity >= 0 ? 'IN' : 'OUT',
      p_quantity: qty,
      p_reason: data.reason,
      p_notes: data.remarks || null,
    });

    if (error) throw error;

    const { data: movement } = await supabase
      .from('stock_movements')
      .select('*, item:stock_items(name)')
      .eq('id', movementId)
      .single();

    const item = (movement as Record<string, unknown> | null)?.item as { name?: string } | null;
    return {
      id: movementId || 'adj-' + Date.now(),
      itemId: data.itemId,
      itemName: item?.name || 'Adjusted Item',
      currentQuantity: (movement as Record<string, unknown> | null)?.previous_quantity as number || 0,
      actualQuantity: (movement as Record<string, unknown> | null)?.new_quantity as number || data.actualQuantity,
      difference: (movement as Record<string, unknown> | null)?.quantity as number || qty,
      reason: data.reason,
      adjustedBy: 'Current User',
      remarks: data.remarks,
      date: (movement as Record<string, unknown> | null)?.created_at as string || new Date().toISOString(),
    };
  },
};
