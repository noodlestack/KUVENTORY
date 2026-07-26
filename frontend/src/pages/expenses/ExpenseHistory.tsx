import { useExpenses } from "@/hooks/expenses/useExpenses";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export function ExpenseHistory() {
  const { expenses, isLoading } = useExpenses();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No expense history found</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  return (
    <div className="space-y-6 mt-4">
      <h2 className="text-xl font-semibold">Expense Timeline</h2>
      <div className="relative border-l border-muted ml-3 space-y-6">
        {expenses.map((exp) => (
          <div key={exp.id} className="relative pl-6">
            <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border ring-4 ring-background">
              <Receipt className="h-3 w-3 text-muted-foreground" />
            </span>
            <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{exp.expenseNo} <span className="font-normal text-muted-foreground">- {exp.categoryName}</span></h3>
                  <span className="text-xs text-muted-foreground">{formatDate(exp.expenseDate)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {exp.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">Status: {exp.status} &bull; Recorded by: {exp.recordedBy}</p>
                  <span className="font-bold text-destructive">{formatCurrency(exp.amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
