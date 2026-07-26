import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseCategory, ExpenseFormData, ExpenseCategoryFormData, ExpenseSummaryData } from "@/types/expenses";
import { mockExpenseService } from "@/services/expenses/mockExpenseService";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    const data = await mockExpenseService.getExpenses();
    setExpenses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const recordExpense = async (data: ExpenseFormData) => {
    const newExpense = await mockExpenseService.createExpense(data);
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = async (id: string, data: ExpenseFormData) => {
    const updated = await mockExpenseService.updateExpense(id, data);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  return { expenses, isLoading, refresh: fetchExpenses, recordExpense, updateExpense };
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const data = await mockExpenseService.getCategories();
    setCategories(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (data: ExpenseCategoryFormData) => {
    const newCategory = await mockExpenseService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const editCategory = async (id: string, data: ExpenseCategoryFormData) => {
    const updated = await mockExpenseService.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  return { categories, isLoading, refresh: fetchCategories, addCategory, editCategory };
}

export function useExpenseSummary() {
  const [summary, setSummary] = useState<ExpenseSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    const data = await mockExpenseService.getSummary();
    setSummary(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, refresh: fetchSummary };
}
