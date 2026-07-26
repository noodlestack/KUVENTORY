import { useState, useEffect, useCallback } from "react";
import { Category, CategoryFormData } from "@/types/categories";
import { mockCategoryService } from "@/services/categories/mockCategoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockCategoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: CategoryFormData) => {
    const newCategory = await mockCategoryService.createCategory(data);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, data: CategoryFormData) => {
    const updatedCategory = await mockCategoryService.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
    return updatedCategory;
  };

  const deleteCategory = async (id: string) => {
    await mockCategoryService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
