export type CategoryStatus = "Active" | "Inactive" | "Archived";

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: CategoryStatus;
}
