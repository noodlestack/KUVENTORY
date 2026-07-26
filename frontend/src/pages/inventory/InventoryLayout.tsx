import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryList } from "./InventoryList";
import { StockMovement } from "./StockMovement";
import { StockAdjustment } from "./StockAdjustment";
import { LowStock } from "./LowStock";
import { InventoryHistory } from "./InventoryHistory";

export function InventoryLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage raw materials, stock levels, and historical movements.</p>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1">
          <TabsTrigger value="list" className="text-xs md:text-sm">Inventory List</TabsTrigger>
          <TabsTrigger value="movements" className="text-xs md:text-sm">Stock Movement</TabsTrigger>
          <TabsTrigger value="adjustments" className="text-xs md:text-sm">Adjustments</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs md:text-sm">Low Stock</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">History</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="list" className="mt-0">
            <InventoryList />
          </TabsContent>
          
          <TabsContent value="movements" className="mt-0">
            <StockMovement />
          </TabsContent>
          
          <TabsContent value="adjustments" className="mt-0">
            <StockAdjustment />
          </TabsContent>
          
          <TabsContent value="low-stock" className="mt-0">
            <LowStock />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <InventoryHistory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
