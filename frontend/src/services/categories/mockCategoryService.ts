import { Category, CategoryFormData } from "@/types/categories";

// Initial mock data
let categories: Category[] = [
  { id: "c1", name: "Grilled Stocks", description: "Grilled items", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c2", name: "Portion Stocks", description: "Portioned ingredients", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c3", name: "Coffee Ingredients", description: "General coffee prep items", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c4", name: "Beverages", description: "Ready to drink", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c5", name: "Rice Meals", description: "Rice supply and prep", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c6", name: "Snacks", description: "Snack ingredients", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c7", name: "Frozen Goods", description: "Freezer inventory", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c8", name: "Bottled Drinks", description: "Bottled inventory", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c9", name: "Canned Drinks", description: "Canned inventory", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c10", name: "Ice Cream", description: "Ice cream tubs", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c11", name: "Coffee Beans", description: "Whole bean coffee", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c12", name: "Syrups", description: "Flavor syrups", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c13", name: "Milk", description: "Dairy and non-dairy", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c14", name: "Condiments", description: "Sauces and condiments", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c15", name: "Supplies", description: "Packaging and cleaning", productCount: 0, status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
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
