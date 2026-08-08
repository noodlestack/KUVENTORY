import { supabase } from '@/integrations/supabase/client';
import { CONFIGURED_DISCOUNTS } from '../discounts/discountService';
import { Expense, ExpenseCategory, ExpenseFormData, ExpenseCategoryFormData, ExpenseSummaryData, ExpenseStatus } from "@/types/expenses";

export const expenseService = {
  // Expense Categories
  getCategories: async (): Promise<ExpenseCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name, description, is_active')
        .order('name');
        
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        isActive: row.is_active
      }));
    } catch (error) {
      console.error('Failed to fetch expense categories:', error);
      return [];
    }
  },

  createCategory: async (formData: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        name: formData.name,
        description: formData.description,
        is_active: formData.isActive
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      isActive: data.is_active
    };
  },

  updateCategory: async (id: string, formData: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    const { data, error } = await supabase
      .from('expense_categories')
      .update({
        name: formData.name,
        description: formData.description,
        is_active: formData.isActive
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      isActive: data.is_active
    };
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          expense_number,
          expense_date,
          status,
          original_amount,
          discount_amount,
          final_amount,
          payment_method,
          supplier_or_payee,
          description,
          notes,
          created_at,
          updated_at,
          category:expense_categories(id, name),
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        expenseNo: row.expense_number,
        expenseDate: row.expense_date,
        categoryId: row.category?.id || '',
        categoryName: row.category?.name || 'Uncategorized',
        description: row.description || '',
        originalAmount: row.original_amount,
        discountAmount: row.discount_amount,
        finalAmount: row.final_amount,
        amount: row.final_amount,
        paymentMethod: row.payment_method || 'Cash',
        referenceNo: '', // DB doesn't have referenceNo in expenses table directly
        supplier: row.supplier_or_payee || '',
        remarks: row.notes || '',
        status: (row.status === 'APPROVED' ? 'Paid' : 
                 row.status === 'VOIDED' ? 'Cancelled' : 
                 row.status === 'PENDING' ? 'Pending' : 'Pending') as ExpenseStatus,
        recordedBy: row.user?.full_name || 'System',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return [];
    }
  },

  createExpense: async (formData: ExpenseFormData): Promise<Expense> => {
    const expenseNumber = `EXP-${Date.now()}`;
    
    let discountAmount = 0;
    if (formData.hasDiscount && formData.discountId) {
      const discount = CONFIGURED_DISCOUNTS.find(d => d.id === formData.discountId);
      if (discount && discount.percentage) {
        discountAmount = formData.originalAmount * (discount.percentage / 100);
      }
    }

    // Get active cash session
    const { data: sessionData } = await supabase.from('cash_sessions').select('id').eq('status', 'OPEN').limit(1).single();
    if (!sessionData && formData.paymentMethod.toUpperCase() === 'CASH') {
        throw new Error("No open cash session for cash payment. Please open a cash session first.");
    }

    const { data: expenseId, error } = await supabase.rpc('create_expense', {
      p_expense_number: expenseNumber,
      p_category_id: formData.categoryId,
      p_supplier_or_payee: formData.supplier || null,
      p_expense_date: formData.expenseDate,
      p_original_amount: formData.originalAmount,
      p_discount_amount: discountAmount,
      p_payment_method: formData.paymentMethod.toUpperCase(),
      p_cash_session_id: formData.paymentMethod.toUpperCase() === 'CASH' ? sessionData?.id : null,
      p_description: formData.description,
      p_notes: formData.remarks || null
    });

    if (error) throw error;

    // In a real app we would refetch, but here we construct the response to save a query
    return {
      id: expenseId,
      expenseNo: expenseNumber,
      expenseDate: formData.expenseDate,
      categoryId: formData.categoryId,
      categoryName: 'Fetching...', // We don't have the name without another query
      description: formData.description,
      originalAmount: formData.originalAmount,
      discountAmount: discountAmount,
      finalAmount: formData.originalAmount - discountAmount,
      amount: formData.originalAmount - discountAmount,
      paymentMethod: formData.paymentMethod,
      supplier: formData.supplier,
      remarks: formData.remarks,
      status: 'Paid',
      recordedBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  updateExpense: async (id: string, formData: ExpenseFormData): Promise<Expense> => {
    // The RPC logic handles creation. Updates might just be simple row updates if allowed by status
    const discountAmount = formData.hasDiscount ? 10 : 0;
    const finalAmount = formData.originalAmount - discountAmount;
    
    const { data, error } = await supabase
      .from('expenses')
      .update({
        category_id: formData.categoryId,
        description: formData.description,
        original_amount: formData.originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: formData.paymentMethod.toUpperCase(),
        supplier_or_payee: formData.supplier,
        notes: formData.remarks
      })
      .eq('id', id)
      .select('*, category:expense_categories(name)')
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      expenseNo: data.expense_number,
      expenseDate: data.expense_date,
      categoryId: data.category_id,
      categoryName: data.category?.name || '',
      description: data.description,
      originalAmount: data.original_amount,
      discountAmount: data.discount_amount,
      finalAmount: data.final_amount,
      amount: data.final_amount,
      paymentMethod: formData.paymentMethod, // Assuming it matches
      supplier: data.supplier_or_payee,
      remarks: data.notes,
      status: 'Paid',
      recordedBy: 'Current User',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Summary
  getSummary: async (): Promise<ExpenseSummaryData | null> => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('final_amount, status, category:expense_categories(name)');
        
      if (error) throw error;
      
      const expenses = data || [];
      const approved = expenses.filter(e => e.status !== 'VOIDED');
      const total = approved.reduce((acc, e) => acc + e.final_amount, 0);
      
      return {
        totalExpenses: total,
        highestExpense: Math.max(0, ...approved.map(e => e.final_amount)),
        lowestExpense: approved.length > 0 ? Math.min(...approved.map(e => e.final_amount)) : 0,
        averageExpense: approved.length > 0 ? total / approved.length : 0,
        expenseCount: approved.length,
        monthlyTrend: [], // Need grouping
        categoryBreakdown: [] // Need grouping
      };
    } catch (error) {
      console.error('Failed to fetch expense summary:', error);
      return null;
    }
  }
};
