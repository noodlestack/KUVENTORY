import { useState, useEffect, useCallback } from "react";
import { Product, ProductFormData } from "@/types/products";
import { mockProductService } from "@/services/products/mockProductService";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await mockProductService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { fetchProducts(); });
  }, [fetchProducts]);

  const createProduct = async (data: ProductFormData, categoryName: string) => {
    const newProduct = await mockProductService.createProduct(data, categoryName);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, data: ProductFormData, categoryName: string) => {
    const updatedProduct = await mockProductService.updateProduct(id, data, categoryName);
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    return updatedProduct;
  };

  const deleteProduct = async (id: string) => {
    await mockProductService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    isLoading,
    error,
    refresh: async () => {
      setIsLoading(true);
      await fetchProducts();
    },
    createProduct,
    updateProduct,
    deleteProduct
  };
}
