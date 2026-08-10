import { supabase } from '@/integrations/supabase/client';
import {
  Expense,
  ExpenseCategory,
  ExpenseFormData,
  ExpenseCategoryFormData,
  ExpenseSummaryData,
  ExpenseStatus,
  PaymentMethod
} from "@/types/expenses";

// Helper: get or auto-open a cash session so expenses can always be recorded
const getOrCreateCashSession = async (): Promise<string | null> => {
  const { data: session } = await supabase
    .from('cash_sessions')
    .select('id')
    .eq('status', 'OPEN')
    .limit(1)
    .maybeSingle();

  if (session) return session.id;

  // Auto-open a session for today so the user doesn't get blocked
  const today = new Date().toISOString().split('T')[0];
  const { data: newSession, error } = await supabase
    .from('cash_sessions')
    .insert({ business_date: today, opening_cash: 0, status: 'OPEN' })
    .select('id')
    .single();

  if (error) {
    console.warn('Could not auto-create cash session:', error.message);
    return null;
  }
  return newSession?.id || null;
};

// Map raw DB expense row to Expense frontend type
const mapExpenseRow = (e: Record<string, unknown>): Expense => {
  const category = e.category as { name?: string } | null;
  return {
    id: e.id as string,
    expenseNo: e.expense_number as string,
    expenseDate: e.expense_date as string,
    categoryId: e.expense_category_id as string,
    categoryName: category?.name || 'Unknown',
    description: (e.description as string) || '',
    originalAmount: Number(e.original_amount ?? 0),
    discountAmount: Number(e.discount_amount ?? 0),
    finalAmount: Number(e.final_amount ?? 0),
    amount: Number(e.final_amount ?? 0),
    paymentMethod: ((e.payment_method as string) || 'Cash') as PaymentMethod,
    referenceNo: (e.reference_number as string) || undefined,
    supplier: (e.supplier_or_payee as string) || undefined,
    remarks: (e.notes as string) || undefined,
    status: ((e.status as string) || 'Paid') as ExpenseStatus,
    recordedBy: 'User',
    createdAt: e.created_at as string,
    updatedAt: e.updated_at as string,
  };
};

export const expenseService = {
  // ─── Categories ───────────────────────────────────────────────────────────

  getCategories: async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      isActive: c.is_active,
    }));
  },

  createCategory: async (formData: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({ name: formData.name, description: formData.description, is_active: formData.isActive })
      .select()
      .single();

    if (error) throw error;

    return { id: data.id, name: data.name, description: data.description || '', isActive: data.is_active };
  },

  updateCategory: async (id: string, formData: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    const { data, error } = await supabase
      .from('expense_categories')
      .update({ name: formData.name, description: formData.description, is_active: formData.isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { id: data.id, name: data.name, description: data.description || '', isActive: data.is_active };
  },

  // ─── Expenses ─────────────────────────────────────────────────────────────

  getExpenses: async (): Promise<Expense[]> => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, category:expense_categories(name)')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return ((data || []) as Record<string, unknown>[]).map(mapExpenseRow);
  },

  createExpense: async (formData: ExpenseFormData): Promise<Expense> => {
    const expenseNumber = `EXP-${Date.now()}`;

    const originalAmount = Number(formData.originalAmount);
    if (isNaN(originalAmount) || originalAmount < 0) {
      throw new Error("Invalid expense amount.");
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (formData.hasDiscount && formData.discountId) {
      const { data: discount } = await supabase
        .from('discount_configs')
        .select('discount_percentage, fixed_discount_amount')
        .eq('id', formData.discountId)
        .single();

      if (discount) {
        if (discount.discount_percentage) {
          discountAmount = originalAmount * (Number(discount.discount_percentage) / 100);
        } else if (discount.fixed_discount_amount) {
          discountAmount = Number(discount.fixed_discount_amount);
        }
      }
    }
    discountAmount = Math.min(discountAmount, originalAmount);

    // Get or auto-open cash session
    const sessionId = await getOrCreateCashSession();

    const { data: expenseId, error } = await supabase.rpc('create_expense', {
      p_expense_number: expenseNumber,
      p_category_id: formData.categoryId,
      p_supplier_or_payee: formData.supplier || null,
      p_expense_date: formData.expenseDate,
      p_original_amount: originalAmount,
      p_discount_amount: discountAmount,
      p_payment_method: formData.paymentMethod.toUpperCase().replace(' ', '_'),
      p_cash_session_id: sessionId,
      p_description: formData.description,
      p_notes: formData.remarks || null,
    });

    if (error) throw error;

    // After creating via RPC, update the status column if set (RPC doesn't handle status)
    if (formData.status && formData.status !== 'Paid') {
      await supabase
        .from('expenses')
        .update({ status: formData.status })
        .eq('id', expenseId);
    }

    // Refetch the created expense for accurate data
    const { data: freshExpense } = await supabase
      .from('expenses')
      .select('*, category:expense_categories(name)')
      .eq('id', expenseId)
      .single();

    if (freshExpense) return mapExpenseRow(freshExpense as Record<string, unknown>);

    // Fallback construction
    return {
      id: expenseId,
      expenseNo: expenseNumber,
      expenseDate: formData.expenseDate,
      categoryId: formData.categoryId,
      categoryName: '',
      description: formData.description,
      originalAmount: originalAmount,
      discountAmount,
      finalAmount: originalAmount - discountAmount,
      amount: originalAmount - discountAmount,
      paymentMethod: formData.paymentMethod,
      supplier: formData.supplier,
      remarks: formData.remarks,
      status: formData.status || 'Paid',
      recordedBy: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  updateExpense: async (id: string, formData: ExpenseFormData): Promise<Expense> => {
    const originalAmount = Number(formData.originalAmount);
    if (isNaN(originalAmount) || originalAmount < 0) {
      throw new Error("Invalid expense amount.");
    }

    // Calculate discount
    let discountAmount = 0;
    if (formData.hasDiscount && formData.discountId) {
      const { data: discount } = await supabase
        .from('discount_configs')
        .select('discount_percentage, fixed_discount_amount')
        .eq('id', formData.discountId)
        .single();

      if (discount) {
        if (discount.discount_percentage) {
          discountAmount = originalAmount * (Number(discount.discount_percentage) / 100);
        } else if (discount.fixed_discount_amount) {
          discountAmount = Number(discount.fixed_discount_amount);
        }
      }
    }
    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = originalAmount - discountAmount;

    const { data, error } = await supabase
      .from('expenses')
      .update({
        expense_category_id: formData.categoryId,   // ← FIXED: correct column name
        description: formData.description,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: formData.paymentMethod.toUpperCase().replace(' ', '_'),
        supplier_or_payee: formData.supplier || null,
        notes: formData.remarks || null,
        status: formData.status || 'Paid',
      })
      .eq('id', id)
      .select('*, category:expense_categories(name)')
      .single();

    if (error) throw error;

    return mapExpenseRow(data as Record<string, unknown>);
  },

  // ─── Summary ──────────────────────────────────────────────────────────────

  getSummary: async (): Promise<ExpenseSummaryData | null> => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const { data: expenses } = await supabase
      .from('expenses')
      .select('final_amount, expense_category_id, category:expense_categories(name)')
      .gte('expense_date', monthStart);

    if (!expenses) return null;

    const amounts = expenses.map(e => Number(e.final_amount ?? 0));
    const total = amounts.reduce((s, a) => s + a, 0);
    const count = amounts.length;

    // Category breakdown
    const catMap: Record<string, number> = {};
    (expenses as Record<string, unknown>[]).forEach(e => {
      const cat = (e.category as { name?: string } | null)?.name || 'Other';
      catMap[cat] = (catMap[cat] || 0) + Number(e.final_amount ?? 0);
    });

    return {
      totalExpenses: total,
      highestExpense: count > 0 ? Math.max(...amounts) : 0,
      lowestExpense: count > 0 ? Math.min(...amounts) : 0,
      averageExpense: count > 0 ? total / count : 0,
      expenseCount: count,
      monthlyTrend: [],
      categoryBreakdown: Object.entries(catMap).map(([name, value]) => ({ name, value })),
    };
  },
};
