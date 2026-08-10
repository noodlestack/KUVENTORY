import { useState, useEffect } from "react";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useCategories } from "@/hooks/categories/useCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Search } from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function DailyInventorySheet() {
  const { items, updateItem, isLoading } = useInventory();
  const { categories } = useCategories();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [localItems, setLocalItems] = useState<Record<string, InventoryItem>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (items) {
      const initialLocal: Record<string, InventoryItem> = {};
      items.forEach(item => {
        initialLocal[item.id] = { ...item };
      });
      // eslint-disable-next-line
      setLocalItems(initialLocal);
    }
  }, [items]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading sheet...</div>;

  const filteredItems = Object.values(localItems).filter(item => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleValueChange = (id: string, field: keyof InventoryItem, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setLocalItems(prev => {
      const item = { ...prev[id], [field]: numValue };
      // Auto-calculate Total and Ending Stock based on new inputs
      item.totalStock = item.beginningStock + item.addedStock;
      item.endingStock = item.totalStock - item.morningSales - item.afternoonSales;
      
      return { ...prev, [id]: item };
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Find items that have changed
      const changedItems = Object.values(localItems).filter(local => {
        const original = items.find(i => i.id === local.id);
        if (!original) return false;
        return (
          local.beginningStock !== original.beginningStock ||
          local.addedStock !== original.addedStock ||
          local.morningSales !== original.morningSales ||
          local.afternoonSales !== original.afternoonSales
        );
      });

      if (changedItems.length === 0) {
        toast.info("No changes to save.");
        setIsSaving(false);
        return;
      }

      // Get the default inventory location for balance updates
      const { data: locData } = await supabase
        .from('inventory_locations')
        .select('id')
        .limit(1)
        .maybeSingle();

      for (const item of changedItems) {
        const original = items.find(i => i.id === item.id);
        const categoryName = categories.find(c => c.id === item.categoryId)?.name || item.categoryName;

        // Update daily inventory line record
        await updateItem(
          item.id,
          {
            name: item.name,
            itemCode: item.itemCode,
            categoryId: item.categoryId,
            unit: item.unit,
            supplier: item.supplier,
            beginningStock: item.beginningStock,
            addedStock: item.addedStock,
            morningSales: item.morningSales,
            afternoonSales: item.afternoonSales,
            cost: item.cost,
            sellingPrice: item.sellingPrice,
            expirationDate: item.expirationDate,
            minStockLevel: item.minStockLevel,
            storageLocation: item.storageLocation,
            status: item.status,
            notes: item.notes,
          },
          categoryName
        );

        // If addedStock increased, update the actual inventory balance
        if (locData && original) {
          const addedDiff = item.addedStock - (original.addedStock || 0);
          if (addedDiff > 0) {
            const { error: adjError } = await supabase.rpc('inventory_adjust', {
              p_stock_item_id: item.id,
              p_location_id: locData.id,
              p_adjustment_type: 'IN',
              p_quantity: addedDiff,
              p_reason: 'Daily Sheet stock addition',
              p_notes: `Added ${addedDiff} via Daily Sheet`,
            });
            if (adjError) {
              console.warn(`Balance update failed for ${item.name}:`, adjError.message);
            }
          } else if (addedDiff < 0) {
            // Stock was reduced on the sheet — adjust out
            const { error: adjError } = await supabase.rpc('inventory_adjust', {
              p_stock_item_id: item.id,
              p_location_id: locData.id,
              p_adjustment_type: 'OUT',
              p_quantity: Math.abs(addedDiff),
              p_reason: 'Daily Sheet stock correction',
              p_notes: `Reduced ${Math.abs(addedDiff)} via Daily Sheet`,
            });
            if (adjError) {
              console.warn(`Balance update failed for ${item.name}:`, adjError.message);
            }
          }
        }
      }
      toast.success(`Successfully updated ${changedItems.length} item${changedItems.length !== 1 ? 's' : ''}.`);
    } catch (error) {
      toast.error("Failed to save changes.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Daily Inventory Sheet</h2>
        <Button onClick={handleSaveAll} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Sheet"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search items..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item Name</TableHead>
              <TableHead className="w-[100px]">Unit</TableHead>
              <TableHead className="text-right">Beginning</TableHead>
              <TableHead className="text-right">Added (+)</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Morning (-)</TableHead>
              <TableHead className="text-right">Afternoon (-)</TableHead>
              <TableHead className="text-right">Ending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium whitespace-nowrap">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.itemCode}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-20 text-right ml-auto h-8" 
                      value={item.beginningStock}
                      onChange={(e) => handleValueChange(item.id, "beginningStock", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-20 text-right ml-auto h-8 border-success/50 focus-visible:ring-success" 
                      value={item.addedStock}
                      onChange={(e) => handleValueChange(item.id, "addedStock", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold bg-muted/20">
                    {item.totalStock}
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-20 text-right ml-auto h-8 border-warning/50 focus-visible:ring-warning" 
                      value={item.morningSales}
                      onChange={(e) => handleValueChange(item.id, "morningSales", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-20 text-right ml-auto h-8 border-warning/50 focus-visible:ring-warning" 
                      value={item.afternoonSales}
                      onChange={(e) => handleValueChange(item.id, "afternoonSales", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className={`text-right font-bold ${item.endingStock <= item.minStockLevel ? 'text-destructive' : ''}`}>
                    {item.endingStock}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
