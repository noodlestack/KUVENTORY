import { Expense, ExpenseCategory, ExpenseFormData, ExpenseCategoryFormData, ExpenseSummaryData } from "@/types/expenses";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

const categories: ExpenseCategory[] = [
  { id: "cat1", name: "Ice", description: "Daily ice supply", isActive: true },
  { id: "cat2", name: "Plastic / Take-out Packaging", description: "Cups, lids, straws, bags", isActive: true },
  { id: "cat3", name: "Operational Expenses", description: "Utilities, rent, maintenance", isActive: true },
  { id: "cat4", name: "Petty Cash", description: "Small day-to-day purchases", isActive: true },
];

const expenses: Expense[] = [
  {
    id: "exp1",
    expenseNo: "EXP-2026-001",
    expenseDate: new Date().toISOString(),
    categoryId: "cat3",
    categoryName: "Operational Expenses",
    description: "Electric Bill - Meralco",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    referenceNo: "REF-987654321",
    supplier: "Meralco",
    status: "Paid",
    recordedBy: "John Doe",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "exp2",
    expenseNo: "EXP-2026-002",
    expenseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    categoryId: "cat2",
    categoryName: "Plastic / Take-out Packaging",
    description: "Cups and straws restock",
    amount: 2500,
    paymentMethod: "Cash",
    supplier: "Local Supplier",
    status: "Paid",
    recordedBy: "Jane Smith",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const mockExpenseService = {
  // Expense Categories
  getCategories: async (): Promise<ExpenseCategory[]> => {
    await delay(500);
    return [...categories];
  },

  createCategory: async (data: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    await delay(600);
    const newCategory: ExpenseCategory = {
      id: generateId("cat"),
      ...data
    };
    categories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, data: ExpenseCategoryFormData): Promise<ExpenseCategory> => {
    await delay(600);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    categories[index] = { ...categories[index], ...data };
    return categories[index];
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    await delay(600);
    return [...expenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  },

  createExpense: async (data: ExpenseFormData): Promise<Expense> => {
    await delay(800);
    const category = categories.find(c => c.id === data.categoryId);
    const newExpense: Expense = {
      id: generateId("exp"),
      expenseNo: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      expenseDate: data.expenseDate,
      categoryId: data.categoryId,
      categoryName: category?.name || "Unknown",
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
      supplier: data.supplier,
      remarks: data.remarks,
      status: data.status,
      recordedBy: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    return newExpense;
  },

  updateExpense: async (id: string, data: ExpenseFormData): Promise<Expense> => {
    await delay(800);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Expense not found");
    
    const category = categories.find(c => c.id === data.categoryId);
    expenses[index] = {
      ...expenses[index],
      ...data,
      categoryName: category?.name || "Unknown",
      updatedAt: new Date().toISOString()
    };
    return expenses[index];
  },

  // Summary
  getSummary: async (): Promise<ExpenseSummaryData> => {
    await delay(600);
    
    const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyExpenses = expenses.filter(e => e.expenseDate.startsWith(currentMonthStr) && e.status !== "Cancelled");
    
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const expenseCount = monthlyExpenses.length;
    const allAmounts = monthlyExpenses.map(e => e.amount);
    
    const highestExpense = allAmounts.length > 0 ? Math.max(...allAmounts) : 0;
    const lowestExpense = allAmounts.length > 0 ? Math.min(...allAmounts) : 0;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

    // Category Breakdown
    const catBreakdownMap: Record<string, number> = {};
    monthlyExpenses.forEach(e => {
      catBreakdownMap[e.categoryName] = (catBreakdownMap[e.categoryName] || 0) + e.amount;
    });
    
    const categoryBreakdown = Object.entries(catBreakdownMap).map(([name, value]) => ({ name, value }));

    // Mock trend for the past 6 months
    const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: d.toLocaleDateString("en-US", { month: 'short' }),
        value: Math.floor(Math.random() * 50000) + 10000
      };
    });

    return {
      totalExpenses,
      highestExpense,
      lowestExpense,
      averageExpense,
      expenseCount,
      monthlyTrend,
      categoryBreakdown
    };
  }
};
