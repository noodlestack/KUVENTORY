import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenses, useExpenseCategories } from "@/hooks/expenses/useExpenses";
import { Expense } from "@/types/expenses";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { ExpenseDetailsDrawer } from "@/components/expenses/ExpenseDetailsDrawer";

export function ExpenseRecords() {
  const { expenses, isLoading, recordExpense, updateExpense } = useExpenses();
  const { categories, isLoading: isLoadingCategories } = useExpenseCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleCreate = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDrawerOpen(false); // Close drawer if editing from drawer
    setTimeout(() => setIsFormOpen(true), 150); // Small delay to allow drawer closing animation
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedExpense) {
      await updateExpense(selectedExpense.id, data);
    } else {
      await recordExpense(data);
    }
  };

  if (isLoading || isLoadingCategories) {
    return <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Expense Records</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search expenses..." className="pl-8" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
        </div>
      </div>
      
      <ExpenseTable 
        expenses={expenses} 
        onView={handleView}
        onEdit={handleEdit}
      />

      <ExpenseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        categories={categories}
        expense={selectedExpense}
        onSubmit={handleFormSubmit}
      />

      <ExpenseDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        expense={selectedExpense}
        onEdit={handleEdit}
      />
    </div>
  );
}
