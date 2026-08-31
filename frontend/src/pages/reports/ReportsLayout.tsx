import { useState, useMemo, useEffect } from "react";
import { Download, Printer, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useCategories } from "@/hooks/categories/useCategories";
import { supabase } from "@/types/supabase";
import { format } from "date-fns";

export function ReportsLayout() {
  const { items, isLoading } = useInventory();
  const { categories } = useCategories();
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [movements, setMovements] = useState<any[]>([]);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchCategory = categoryFilter === "ALL" || item.category_id === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [items, statusFilter, categoryFilter]);

  useEffect(() => {
    async function fetchMovements() {
      if (!selectedDate) return;
      setIsMovementsLoading(true);
      try {
        const { data, error } = await supabase
          .from('stock_movements')
          .select(`
            id, movement_type, quantity, reason, created_at,
            inventory_items ( sku, name, unit, categories (name) )
          `)
          .gte('created_at', `${selectedDate}T00:00:00Z`)
          .lte('created_at', `${selectedDate}T23:59:59Z`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMovements(data || []);
      } catch (err) {
        console.error("Failed to fetch movements:", err);
      } finally {
        setIsMovementsLoading(false);
      }
    }
    fetchMovements();
  }, [selectedDate]);

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    
    const headers = ["SKU", "Name", "Category", "Supplier", "Cost", "Current Stock", "Minimum Stock", "Unit", "Status", "Last Updated"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => [
        `"${item.sku}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category_name}"`,
        `"${item.supplier_name || ''}"`,
        item.cost,
        item.current_stock,
        item.minimum_stock,
        `"${item.unit || ''}"`,
        `"${item.status}"`,
        `"${format(new Date(item.updated_at), 'yyyy-MM-dd HH:mm')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventory_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading report data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export inventory reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4 print:hidden">
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="daily">Daily Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card className="print:shadow-none print:border-none">
            <CardHeader className="print:hidden">
              <CardTitle>Inventory Status Report</CardTitle>
              <CardDescription>Filter your inventory items to generate a customized report.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Category Filter
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="IN_STOCK">In Stock</SelectItem>
                      <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="hidden print:block mb-4">
                <h2 className="text-2xl font-bold">Inventory Status Report</h2>
                <p className="text-sm text-gray-500">Generated on: {format(new Date(), 'PPpp')}</p>
                <p className="text-sm text-gray-500">
                  Filters applied: {categoryFilter === 'ALL' ? 'All Categories' : categories.find(c => c.id === categoryFilter)?.name} | {statusFilter === 'ALL' ? 'All Statuses' : statusFilter.replace('_', ' ')}
                </p>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No items match the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category_name}</TableCell>
                          <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.current_stock} {item.unit && <span className="text-xs text-muted-foreground">{item.unit}</span>}
                          </TableCell>
                          <TableCell>{item.status.replace('_', ' ')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card className="print:shadow-none print:border-none">
            <CardHeader className="print:hidden">
              <CardTitle>Daily Movements Report</CardTitle>
              <CardDescription>View all stock IN/OUT transactions and adjustments for a specific date.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 print:hidden max-w-sm">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" /> Select Date
                </label>
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                />
              </div>

              <div className="hidden print:block mb-4">
                <h2 className="text-2xl font-bold">Daily Movements Report</h2>
                <p className="text-sm text-gray-500">Date: {selectedDate}</p>
                <p className="text-sm text-gray-500">Generated on: {format(new Date(), 'PPpp')}</p>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isMovementsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          Loading movements...
                        </TableCell>
                      </TableRow>
                    ) : movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No stock movements found for {selectedDate}.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map(mov => (
                        <TableRow key={mov.id}>
                          <TableCell className="whitespace-nowrap">{format(new Date(mov.created_at), 'HH:mm:ss')}</TableCell>
                          <TableCell className="font-medium">{mov.inventory_items?.name}</TableCell>
                          <TableCell>{mov.inventory_items?.categories?.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              mov.movement_type === 'ADD' ? 'bg-green-100 text-green-700' :
                              mov.movement_type === 'REMOVE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {mov.movement_type.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {mov.movement_type === 'REMOVE' ? '-' : '+'}{mov.quantity} {mov.inventory_items?.unit}
                          </TableCell>
                          <TableCell className="text-xs">{mov.reason || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
