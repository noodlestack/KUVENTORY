export type ProductStatus = "Active" | "Inactive" | "Out of Stock" | "Low Stock";

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  sellingPrice: number;
  stockLevel: number;
  minStockLevel: number;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  description?: string;
  status: ProductStatus;
}
