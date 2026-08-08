import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseCategory, ExpenseFormData, ExpenseCategoryFormData, ExpenseSummaryData } from "@/types/expenses";
import { expenseService } from "@/services/expenses/expenseService";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    const data = await expenseService.getExpenses();
    setExpenses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchExpenses();
    });
  }, [fetchExpenses]);

  const recordExpense = async (data: ExpenseFormData) => {
    try {
    const newExpense = await expenseService.createExpense(data);
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const updateExpense = async (id: string, data: ExpenseFormData) => {
    try {
    const updated = await expenseService.updateExpense(id, data);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  return { expenses, isLoading, refresh: fetchExpenses, recordExpense, updateExpense };
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const data = await expenseService.getCategories();
    setCategories(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchCategories();
    });
  }, [fetchCategories]);

  const addCategory = async (data: ExpenseCategoryFormData) => {
    try {
    const newCategory = await expenseService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  const editCategory = async (id: string, data: ExpenseCategoryFormData) => {
    try {
    const updated = await expenseService.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Action failed');
      throw error;
    }
  };

  return { categories, isLoading, refresh: fetchCategories, addCategory, editCategory };
}

export function useExpenseSummary() {
  const [summary, setSummary] = useState<ExpenseSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    const data = await expenseService.getSummary();
    setSummary(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSummary();
    });
  }, [fetchSummary]);

  return { summary, isLoading, refresh: fetchSummary };
}
