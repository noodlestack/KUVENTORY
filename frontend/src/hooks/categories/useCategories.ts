import { useState, useEffect, useCallback } from "react";
import { Category, CategoryFormData } from "@/types/categories";
import { categoryService } from "@/services/categories/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { fetchCategories(); });
  }, [fetchCategories]);

  const createCategory = async (data: CategoryFormData) => {
    const newCategory = await categoryService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, data: CategoryFormData) => {
    const updatedCategory = await categoryService.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    return updatedCategory;
  };

  const archiveCategory = async (id: string) => {
    await categoryService.archiveCategory(id);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, status: "Archived" } : c));
  };

  return {
    categories,
    isLoading,
    error,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory
  };
}
