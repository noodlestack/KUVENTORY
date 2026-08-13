import { supabase } from '@/integrations/supabase/client';
import { Discount, DiscountFormData, DiscountType } from "@/types/discounts";

const mapToDBDiscountType = (uiType: string): string => {
  const mapping: Record<string, string> = {
    "Senior Citizen": "SENIOR_CITIZEN",
    "PWD": "PWD",
    "Delivery Driver": "DELIVERY_DRIVER",
    "Employee": "EMPLOYEE",
    "Promotional": "PROMOTIONAL",
    "Supplier": "SUPPLIER",
    "Vendor": "VENDOR",
    "Manual": "MANUAL",
    "Custom": "CUSTOM",
    "None": "PROMOTIONAL" // "NONE" is not allowed in DB check constraint
  };
  return mapping[uiType] || "PROMOTIONAL";
};

const mapToUIDiscountType = (dbType: string): DiscountType => {
  const mapping: Record<string, DiscountType> = {
    "SENIOR_CITIZEN": "Senior Citizen",
    "PWD": "PWD",
    "DELIVERY_DRIVER": "Delivery Driver",
    "EMPLOYEE": "Employee",
    "PROMOTIONAL": "Promotional",
    "SUPPLIER": "Supplier",
    "VENDOR": "Vendor",
    "MANUAL": "Manual",
    "CUSTOM": "Custom",
    "NONE": "None",
    "PERCENTAGE": "Promotional",
    "FIXED_AMOUNT": "Manual"
  };
  return mapping[dbType] || "Promotional";
};

export const discountService = {
  getDiscounts: async (): Promise<Discount[]> => {
    const { data, error } = await supabase
      .from('discount_configs')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      type: mapToUIDiscountType(d.discount_type),
      percentage: d.discount_percentage || undefined,
      amount: d.fixed_discount_amount || undefined,
      isActive: d.is_active,
      description: d.description || undefined,
      requirements: d.requirements || undefined
    }));
  },

  createDiscount: async (data: DiscountFormData): Promise<Discount> => {
    const { data: newDiscount, error } = await supabase
      .from('discount_configs')
      .insert({
        name: data.name,
        discount_type: mapToDBDiscountType(data.type),
        discount_percentage: data.percentage || null,
        fixed_discount_amount: data.amount || null,
        is_active: data.isActive,
        description: data.description || null,
        requirements: data.requirements || null
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      id: newDiscount.id,
      name: newDiscount.name,
      type: mapToUIDiscountType(newDiscount.discount_type),
      percentage: newDiscount.discount_percentage || undefined,
      amount: newDiscount.fixed_discount_amount || undefined,
      isActive: newDiscount.is_active,
      description: newDiscount.description || undefined,
      requirements: newDiscount.requirements || undefined
    };
  },

  updateDiscount: async (id: string, data: DiscountFormData): Promise<Discount> => {
    const { data: updated, error } = await supabase
      .from('discount_configs')
      .update({
        name: data.name,
        discount_type: mapToDBDiscountType(data.type),
        discount_percentage: data.percentage || null,
        fixed_discount_amount: data.amount || null,
        is_active: data.isActive,
        description: data.description || null,
        requirements: data.requirements || null
      })
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      id: updated.id,
      name: updated.name,
      type: mapToUIDiscountType(updated.discount_type),
      percentage: updated.discount_percentage || undefined,
      amount: updated.fixed_discount_amount || undefined,
      isActive: updated.is_active,
      description: updated.description || undefined,
      requirements: updated.requirements || undefined
    };
  },
  
  deleteDiscount: async (id: string): Promise<void> => {
    // Soft delete
    const { error } = await supabase
      .from('discount_configs')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
  }
};
