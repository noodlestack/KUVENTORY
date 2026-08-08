export type ExpenseStatus = "Paid" | "Pending" | "Cancelled";
export type PaymentMethod = "Cash" | "GCash" | "Bank Transfer" | "Check";

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  expenseNo: string;
  expenseDate: string;
  categoryId: string;
  categoryName: string;
  description: string;
  originalAmount: number;
  discountId?: string;
  discountAmount?: number;
  finalAmount: number;
  amount: number; // Keep for backward compatibility/reporting mapping if needed, or define as finalAmount
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  supplier?: string;
  remarks?: string;
  status: ExpenseStatus;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  expenseDate: string;
  categoryId: string;
  description: string;
  originalAmount: number;
  hasDiscount?: boolean;
  discountId?: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  supplier?: string;
  remarks?: string;
  status: ExpenseStatus;
}

export interface ExpenseCategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ExpenseSummaryData {
  totalExpenses: number;
  highestExpense: number;
  lowestExpense: number;
  averageExpense: number;
  expenseCount: number;
  monthlyTrend: { name: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
}
