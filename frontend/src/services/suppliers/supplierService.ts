import { supabase } from '@/integrations/supabase/client';
import { Supplier, SupplierFormData, SupplierStatus } from "@/types/suppliers";

export const supplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          id,
          name,
          contact_person,
          email,
          phone,
          address,
          is_active,
          created_at
        `)
        .order('name');
        
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        contactPerson: row.contact_person || '',
        phoneNumber: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        status: (row.is_active ? 'Active' : 'Inactive') as SupplierStatus,
        dateAdded: row.created_at,
        totalPurchases: 0,
        hasDefaultDiscount: false, // We'd need to query supplier_discount_policies to get this
        defaultDiscountId: undefined
      }));
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  },

  createSupplier: async (formData: SupplierFormData): Promise<Supplier> => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: formData.name,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phoneNumber,
        address: formData.address,
        is_active: formData.status === 'Active'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person || '',
      phoneNumber: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      status: (data.is_active ? 'Active' : 'Inactive') as SupplierStatus,
      dateAdded: data.created_at,
      totalPurchases: 0,
      hasDefaultDiscount: false,
      defaultDiscountId: undefined
    };
  },

  updateSupplier: async (id: string, formData: SupplierFormData): Promise<Supplier> => {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        name: formData.name,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phoneNumber,
        address: formData.address,
        is_active: formData.status === 'Active'
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person || '',
      phoneNumber: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      status: (data.is_active ? 'Active' : 'Inactive') as SupplierStatus,
      dateAdded: data.created_at,
      totalPurchases: 0,
      hasDefaultDiscount: false,
      defaultDiscountId: undefined
    };
  },

  deleteSupplier: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
  }
};
