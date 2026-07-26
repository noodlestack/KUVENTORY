import { useSalesSummary } from "@/hooks/sales/useSales";
import { SalesSummaryDashboard } from "@/components/sales/SalesSummaryDashboard";

export function SalesSummary() {
  const { summary, isLoading } = useSalesSummary();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading sales summary...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Daily Sales Summary</h2>
      <SalesSummaryDashboard summary={summary} />
    </div>
  );
}
