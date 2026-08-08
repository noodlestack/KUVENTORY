import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/categories/useCategories";
import { Category, CategoryStatus } from "@/types/categories";
import { toast } from "sonner";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess?: (category: Category) => void;
}

export function CategoryFormDialog({ isOpen, onClose, category, onSuccess }: CategoryFormDialogProps) {
  const { createCategory, updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("Active");

  useEffect(() => {
    if (isOpen) {
      if (category) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(category.name);
        setDescription(category.description || "");
        setStatus(category.status);
      } else {
        setName("");
        setDescription("");
        setStatus("Active");
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (name.length > 50) {
      toast.error("Category name is too long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = { name, description, status };
      let savedCategory;
      if (category) {
        savedCategory = await updateCategory(category.id, data);
        toast.success("Category updated successfully.");
      } else {
        savedCategory = await createCategory(data);
        toast.success("Category created successfully.");
      }
      onSuccess?.(savedCategory);
      onClose();
    } catch (error) {
      toast.error(category ? "Failed to update category." : "Failed to create category.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {category ? "Modify the category details below." : "Create a new inventory category."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dairy, Packaging"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            {category && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as CategoryStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
