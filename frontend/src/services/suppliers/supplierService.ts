import { supabase } from '@/integrations/supabase/client';
import { Supplier, SupplierFormData, SupplierStatus } from "@/types/suppliers";

export const supplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    
    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contact_person || '',
      phoneNumber: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      status: (s.is_active ? 'Active' : 'Inactive') as SupplierStatus,
      dateAdded: s.created_at,
      totalPurchases: 0,
      hasDefaultDiscount: false
    }));
  },

  createSupplier: async (formData: SupplierFormData): Promise<Supplier> => {
    // Generate a unique supplier_code — required by the DB NOT NULL constraint
    const supplierCode = `SUP-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: formData.name,
        supplier_code: supplierCode,       // ← Required: NOT NULL UNIQUE
        contact_person: formData.contactPerson || null,
        email: formData.email || null,
        phone: formData.phoneNumber || null,
        address: formData.address || null,
        notes: formData.notes || null,
        is_active: formData.status !== 'Inactive',
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
      defaultDiscountId: undefined,
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
