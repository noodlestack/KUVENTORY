import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryFormData } from '@/types/categories';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      created_at: c.created_at
    }));
  },

  createCategory: async (formData: CategoryFormData): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: formData.name,
        description: formData.description || null,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      created_at: data.created_at
    };
  },

  updateCategory: async (id: string, formData: CategoryFormData): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: formData.name,
        description: formData.description || null,
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      created_at: data.created_at
    };
  },

  deleteCategory: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      if (error.code === '23503') {
        throw new Error("Cannot delete category because it has associated inventory items.");
      }
      throw error;
    }
  }
};
