import { Category, CategoryFormData } from "@/types/categories";

// Initial mock data
let categories: Category[] = [
  { id: "c1", name: "Coffee", description: "Espresso based drinks", productCount: 15, status: "Active", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-01-10T08:00:00Z" },
  { id: "c2", name: "Non-Coffee", description: "Teas and other beverages", productCount: 8, status: "Active", createdAt: "2026-01-12T09:30:00Z", updatedAt: "2026-01-12T09:30:00Z" },
  { id: "c3", name: "Rice Meals", description: "Silog and other rice bowls", productCount: 12, status: "Active", createdAt: "2026-01-15T11:20:00Z", updatedAt: "2026-01-15T11:20:00Z" },
  { id: "c4", name: "Pasta", description: "Various pasta dishes", productCount: 5, status: "Active", createdAt: "2026-02-05T14:15:00Z", updatedAt: "2026-02-05T14:15:00Z" },
  { id: "c5", name: "Snacks", description: "Fries, wings, and sides", productCount: 10, status: "Active", createdAt: "2026-02-10T10:45:00Z", updatedAt: "2026-02-10T10:45:00Z" },
  { id: "c6", name: "Desserts", description: "Cakes and pastries", productCount: 6, status: "Inactive", createdAt: "2026-03-01T16:00:00Z", updatedAt: "2026-03-01T16:00:00Z" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockCategoryService = {
  getCategories: async (): Promise<Category[]> => {
    await delay(600);
    return [...categories];
  },
  
  getCategory: async (id: string): Promise<Category | null> => {
    await delay(300);
    return categories.find(c => c.id === id) || null;
  },

  createCategory: async (data: CategoryFormData): Promise<Category> => {
    await delay(600);
    const newCategory: Category = {
      id: `c${Date.now()}`,
      name: data.name,
      description: data.description || "",
      productCount: 0,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories = [...categories, newCategory];
    return newCategory;
  },

  updateCategory: async (id: string, data: CategoryFormData): Promise<Category> => {
    await delay(600);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    const updatedCategory = {
      ...categories[index],
      name: data.name,
      description: data.description || "",
      status: data.status,
      updatedAt: new Date().toISOString(),
    };
    categories = [
      ...categories.slice(0, index),
      updatedCategory,
      ...categories.slice(index + 1)
    ];
    return updatedCategory;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await delay(600);
    categories = categories.filter(c => c.id !== id);
  }
};
