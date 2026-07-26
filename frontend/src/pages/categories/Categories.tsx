import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/categories/useCategories";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { Category } from "@/types/categories";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Categories() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and structure.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <CategoryTable 
        categories={categories} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <CategoryFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
        onSubmit={async (data) => {
          if (selectedCategory) {
            await updateCategory(selectedCategory.id, data);
          } else {
            await createCategory(data);
          }
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedCategory?.name}" category? This action cannot be undone.
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
