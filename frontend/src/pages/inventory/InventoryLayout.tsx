import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryList } from "./InventoryList";
import { LowStock } from "./LowStock";
import { InventoryHistory } from "./InventoryHistory";
import { DailyInventorySheet } from "./DailyInventorySheet";

export function InventoryLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage raw materials, stock levels, and historical movements.</p>
      </div>
      
      <Tabs defaultValue="daily-sheet" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1">
          <TabsTrigger value="daily-sheet" className="text-xs md:text-sm">Daily Sheet</TabsTrigger>
          <TabsTrigger value="list" className="text-xs md:text-sm">Master List</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs md:text-sm">Low Stock</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">History</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="daily-sheet" className="mt-0">
            <DailyInventorySheet />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <InventoryList />
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
