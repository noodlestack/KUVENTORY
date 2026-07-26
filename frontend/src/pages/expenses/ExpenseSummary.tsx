import { useExpenseSummary } from "@/hooks/expenses/useExpenses";
import { ExpenseSummaryDashboard } from "@/components/expenses/ExpenseSummaryDashboard";

export function ExpenseSummary() {
  const { summary, isLoading } = useExpenseSummary();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading expense summary...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Monthly Expense Summary</h2>
      <ExpenseSummaryDashboard summary={summary} />
    </div>
  );
}
