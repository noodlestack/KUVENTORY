import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseRecord } from "./PurchaseRecord";
import { PurchaseHistory } from "./PurchaseHistory";

export function PurchasesLayout() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchasing</h1>
        <p className="text-muted-foreground">Manage inbound inventory and view purchase records.</p>
      </div>
      
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1 md:w-[400px]">
          <TabsTrigger value="records" className="text-xs md:text-sm">Purchase Records</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">Purchase History</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="records" className="mt-0">
            <PurchaseRecord />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <PurchaseHistory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
