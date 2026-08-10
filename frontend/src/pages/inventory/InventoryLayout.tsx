import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryList } from "./InventoryList";
import { LowStock } from "./LowStock";
import { InventoryHistory } from "./InventoryHistory";
import { DailyInventorySheet } from "./DailyInventorySheet";
import { ArchivedInventory } from "./ArchivedInventory";

export function InventoryLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage raw materials, stock levels, and historical movements.</p>
      </div>

      <Tabs defaultValue="daily-sheet" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="daily-sheet" className="text-xs md:text-sm flex-1 min-w-[80px]">Daily Sheet</TabsTrigger>
          <TabsTrigger value="list" className="text-xs md:text-sm flex-1 min-w-[80px]">Master List</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs md:text-sm flex-1 min-w-[80px]">Low Stock</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm flex-1 min-w-[80px]">History</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs md:text-sm flex-1 min-w-[80px]">Archived</TabsTrigger>
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

          <TabsContent value="archived" className="mt-0">
            <ArchivedInventory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
