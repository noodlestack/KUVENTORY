import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { Category, CategoryFormData } from "@/types/categories";
import { categoryService } from "@/services/categories/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: CategoryFormData) => {
    try {
      const newCategory = await categoryService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      toast.success("Category created successfully");
      return newCategory;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
      throw error;
    }
  };

  const updateCategory = async (id: string, data: CategoryFormData) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, data);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      toast.success("Category updated successfully");
      return updatedCategory;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
      throw error;
    }
  };

  return {
    categories,
    isLoading,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
