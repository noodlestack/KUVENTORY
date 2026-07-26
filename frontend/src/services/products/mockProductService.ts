import { Product, ProductFormData, ProductStatus } from "@/types/products";

// Initial mock data
let products: Product[] = [
  { id: "p1", name: "Americano", sku: "COF-001", categoryId: "c1", categoryName: "Coffee", costPrice: 45, sellingPrice: 120, stockLevel: 50, minStockLevel: 20, description: "Classic black coffee", status: "Active", createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-01-10T08:00:00Z" },
  { id: "p2", name: "Spanish Latte", sku: "COF-002", categoryId: "c1", categoryName: "Coffee", costPrice: 65, sellingPrice: 160, stockLevel: 45, minStockLevel: 15, description: "Sweet milk based coffee", status: "Active", createdAt: "2026-01-10T08:30:00Z", updatedAt: "2026-01-10T08:30:00Z" },
  { id: "p3", name: "Cappuccino", sku: "COF-003", categoryId: "c1", categoryName: "Coffee", costPrice: 60, sellingPrice: 150, stockLevel: 8, minStockLevel: 10, description: "Espresso with steamed milk foam", status: "Low Stock", createdAt: "2026-01-11T09:00:00Z", updatedAt: "2026-01-11T09:00:00Z" },
  { id: "p4", name: "Matcha Latte", sku: "NCOF-001", categoryId: "c2", categoryName: "Non-Coffee", costPrice: 70, sellingPrice: 170, stockLevel: 0, minStockLevel: 15, description: "Premium matcha with milk", status: "Out of Stock", createdAt: "2026-01-12T09:30:00Z", updatedAt: "2026-01-12T09:30:00Z" },
  { id: "p5", name: "Tapsilog", sku: "RICE-001", categoryId: "c3", categoryName: "Rice Meals", costPrice: 85, sellingPrice: 180, stockLevel: 25, minStockLevel: 10, description: "Beef tapa, sinangag, and itlog", status: "Active", createdAt: "2026-01-15T11:20:00Z", updatedAt: "2026-01-15T11:20:00Z" },
  { id: "p6", name: "Chicken Wings", sku: "SNK-001", categoryId: "c5", categoryName: "Snacks", costPrice: 120, sellingPrice: 250, stockLevel: 30, minStockLevel: 15, description: "6pcs buffalo chicken wings", status: "Active", createdAt: "2026-02-10T10:45:00Z", updatedAt: "2026-02-10T10:45:00Z" },
  { id: "p7", name: "French Fries", sku: "SNK-002", categoryId: "c5", categoryName: "Snacks", costPrice: 40, sellingPrice: 100, stockLevel: 100, minStockLevel: 30, description: "Crispy shoestring fries", status: "Active", createdAt: "2026-02-10T11:00:00Z", updatedAt: "2026-02-10T11:00:00Z" },
  { id: "p8", name: "Carbonara", sku: "PST-001", categoryId: "c4", categoryName: "Pasta", costPrice: 90, sellingPrice: 220, stockLevel: 12, minStockLevel: 15, description: "Creamy white sauce with bacon", status: "Low Stock", createdAt: "2026-02-05T14:15:00Z", updatedAt: "2026-02-05T14:15:00Z" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to determine status dynamically if stock changes
const determineStatus = (stockLevel: number, minStockLevel: number, currentStatus: ProductStatus): ProductStatus => {
  if (currentStatus === "Inactive") return "Inactive";
  if (stockLevel === 0) return "Out of Stock";
  if (stockLevel < minStockLevel) return "Low Stock";
  return "Active";
};

export const mockProductService = {
  getProducts: async (): Promise<Product[]> => {
    await delay(800);
    return [...products];
  },
  
  getProduct: async (id: string): Promise<Product | null> => {
    await delay(300);
    return products.find(p => p.id === id) || null;
  },

  createProduct: async (data: ProductFormData, categoryName: string): Promise<Product> => {
    await delay(800);
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId,
      categoryName,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      stockLevel: 0,
      minStockLevel: data.minStockLevel,
      description: data.description || "",
      status: determineStatus(0, data.minStockLevel, data.status),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products = [...products, newProduct];
    return newProduct;
  },

  updateProduct: async (id: string, data: ProductFormData, categoryName: string): Promise<Product> => {
    await delay(800);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    
    const existing = products[index];
    const updatedProduct: Product = {
      ...existing,
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId,
      categoryName,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      minStockLevel: data.minStockLevel,
      description: data.description || "",
      status: determineStatus(existing.stockLevel, data.minStockLevel, data.status),
      updatedAt: new Date().toISOString(),
    };
    
    products = [
      ...products.slice(0, index),
      updatedProduct,
      ...products.slice(index + 1)
    ];
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(800);
    products = products.filter(p => p.id !== id);
  }
};
