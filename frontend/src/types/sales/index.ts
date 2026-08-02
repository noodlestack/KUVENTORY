export type SaleStatus = "Completed" | "Refunded" | "Voided";

export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  transactionNo: string;
  saleDate: string;
  customerName?: string;
  items: SaleItem[];
  totalAmount: number; // Gross amount
  discountName?: string;
  discountAmount?: number;
  netAmount: number; // Total after discount
  status: SaleStatus;
  remarks?: string;
  recordedBy: string;
}

export interface SaleFormData {
  saleDate: string;
  customerName?: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
  discountName?: string;
  discountAmount?: number;
  remarks?: string;
  status: SaleStatus;
}

export interface SalesSummaryData {
  grossIncome: number;
  netIncome: number;
  totalRefunds: number;
  totalDiscounts: number;
  todaySales: number;
  transactionsCount: number;
  bestSellingProduct: string;
  averageSale: number;
  highestSale: number;
  lowestSale: number;
  chartData: { date: string; sales: number }[];
}
