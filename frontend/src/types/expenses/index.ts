export type ExpenseStatus = "Paid" | "Pending" | "Cancelled";

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
  amount: number;
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
  amount: number;
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
