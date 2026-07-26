import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenseCategories } from "@/hooks/expenses/useExpenses";
import { ExpenseCategory } from "@/types/expenses";
import { ExpenseCategoryTable } from "@/components/expenses/ExpenseCategoryTable";
import { ExpenseCategoryFormDialog } from "@/components/expenses/ExpenseCategoryFormDialog";

export function ExpenseCategories() {
  const { categories, isLoading, addCategory, editCategory } = useExpenseCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedCategory) {
      await editCategory(selectedCategory.id, data);
    } else {
      await addCategory(data);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Expense Categories</h2>
          <p className="text-sm text-muted-foreground">Manage classification categories for your expenses.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>
      
      <ExpenseCategoryTable 
        categories={categories} 
        onEdit={handleEdit}
      />

      <ExpenseCategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
