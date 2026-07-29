import React, { Suspense } from "react";
import { useSalesSummary } from "@/hooks/sales/useSales";
const SalesSummaryDashboard = React.lazy(() => import("@/components/sales/SalesSummaryDashboard").then(m => ({ default: m.SalesSummaryDashboard })));

export function SalesSummary() {
  const { summary, isLoading } = useSalesSummary();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading sales summary...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Daily Sales Summary</h2>
      <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-md" />}>
        <SalesSummaryDashboard summary={summary} />
      </Suspense>
    </div>
  );
}
