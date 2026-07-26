import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesRecords } from "./SalesRecords";
import { SalesHistory } from "./SalesHistory";
import { SalesSummary } from "./SalesSummary";

export function SalesLayout() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales & Transactions</h1>
        <p className="text-muted-foreground">Record and review daily sales and transaction history.</p>
      </div>
      
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1 md:w-[500px]">
          <TabsTrigger value="records" className="text-xs md:text-sm">Sales Records</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs md:text-sm">Daily Summary</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="records" className="mt-0">
            <SalesRecords />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <SalesHistory />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <SalesSummary />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
