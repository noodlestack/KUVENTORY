import React, { Suspense } from "react";
import { useExpenseSummary } from "@/hooks/expenses/useExpenses";
const ExpenseSummaryDashboard = React.lazy(() => import("@/components/expenses/ExpenseSummaryDashboard").then(m => ({ default: m.ExpenseSummaryDashboard })));

export function ExpenseSummary() {
  const { summary, isLoading } = useExpenseSummary();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading expense summary...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Monthly Expense Summary</h2>
      <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-md" />}>
        <ExpenseSummaryDashboard summary={summary} />
      </Suspense>
    </div>
  );
}
