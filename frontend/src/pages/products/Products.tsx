import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/products/useProducts";
import { useCategories } from "@/hooks/categories/useCategories";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { ProductDetailsDrawer } from "@/components/products/ProductDetailsDrawer";
import { Product } from "@/types/products";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Products() {
  const { products, isLoading: isLoadingProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const isLoading = isLoadingProducts || isLoadingCategories;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your inventory products and pricing.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductTable 
        products={products} 
        onView={handleView}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <ProductFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        categories={categories}
        onSubmit={async (data, categoryName) => {
          if (selectedProduct) {
            await updateProduct(selectedProduct.id, data, categoryName);
          } else {
            await createProduct(data, categoryName);
          }
        }}
      />

      <ProductDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        product={selectedProduct}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
