import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryFormData, CategoryStatus } from '@/types/categories';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, stock_items(count)')
      .eq('is_active', true);
    if (error) throw error;
    
    return (data || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      itemCount: c.stock_items?.[0]?.count || 0,
      status: (c.is_active ? 'Active' : 'Inactive') as CategoryStatus,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCategory: async (_id: string): Promise<Category | null> => {
    return null;
  },

  createCategory: async (formData: CategoryFormData): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: formData.name,
        code: `CAT-${formData.name.toUpperCase().substring(0, 3)}`,
        description: formData.description || null,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      itemCount: 0,
      status: 'Active',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  updateCategory: async (id: string, formData: CategoryFormData): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: formData.name,
        description: formData.description || null,
        is_active: formData.status === 'Active'
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      itemCount: 0, // This would require another query to get the true count if needed immediately
      status: (data.is_active ? 'Active' : 'Inactive') as CategoryStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  archiveCategory: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
  }
};
