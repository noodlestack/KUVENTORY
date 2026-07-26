import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseRecords } from "./ExpenseRecords";
import { ExpenseCategories } from "./ExpenseCategories";
import { ExpenseHistory } from "./ExpenseHistory";
import { ExpenseSummary } from "./ExpenseSummary";

export function ExpensesLayout() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
        <p className="text-muted-foreground">Monitor and manage operational expenses.</p>
      </div>
      
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto md:h-10 gap-1 md:gap-0 bg-muted/50 p-1 md:w-[600px]">
          <TabsTrigger value="records" className="text-xs md:text-sm">Records</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs md:text-sm">Categories</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs md:text-sm">Summary</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="records" className="mt-0">
            <ExpenseRecords />
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <ExpenseCategories />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <ExpenseHistory />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <ExpenseSummary />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
