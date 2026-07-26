export type CategoryStatus = "Active" | "Inactive";

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: CategoryStatus;
}
