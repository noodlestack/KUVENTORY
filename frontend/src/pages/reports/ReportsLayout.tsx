import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { SalesReports } from "./SalesReports";
import { InventoryReports } from "./InventoryReports";
import { PurchaseReports } from "./PurchaseReports";
import { ExpenseReports } from "./ExpenseReports";
import { SupplierReports } from "./SupplierReports";

export function ReportsLayout() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your business performance.</p>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="flex w-full overflow-x-auto h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1 justify-start">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm whitespace-nowrap">Dashboard</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs md:text-sm whitespace-nowrap">Sales</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs md:text-sm whitespace-nowrap">Inventory</TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs md:text-sm whitespace-nowrap">Purchases</TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs md:text-sm whitespace-nowrap">Expenses</TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs md:text-sm whitespace-nowrap">Suppliers</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="dashboard" className="mt-0"><AnalyticsDashboard /></TabsContent>
          <TabsContent value="sales" className="mt-0"><SalesReports /></TabsContent>
          <TabsContent value="inventory" className="mt-0"><InventoryReports /></TabsContent>
          <TabsContent value="purchases" className="mt-0"><PurchaseReports /></TabsContent>
          <TabsContent value="expenses" className="mt-0"><ExpenseReports /></TabsContent>
          <TabsContent value="suppliers" className="mt-0"><SupplierReports /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
