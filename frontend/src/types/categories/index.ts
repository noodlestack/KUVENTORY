export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}
