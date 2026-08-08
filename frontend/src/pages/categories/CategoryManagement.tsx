import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/categories/useCategories";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { Category } from "@/types/categories";
import { format } from "date-fns";

export function CategoryManagement() {
  const { categories, isLoading, error, refreshCategories, archiveCategory } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this category? It will still be visible on existing items but hidden from new selections.")) {
      await archiveCategory(id);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error loading categories.</p>
        <Button variant="outline" className="mt-4" onClick={refreshCategories}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Manage your inventory categories here.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Inventory Categories</CardTitle>
          <CardDescription>View and manage the categories used for categorizing supplies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/20">
              <p>No categories found.</p>
              {searchQuery && <p className="text-sm mt-1">Try clearing your search query.</p>}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {cat.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.status === "Active" ? "default" : cat.status === "Archived" ? "secondary" : "outline"}>
                          {cat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {cat.createdAt ? format(new Date(cat.createdAt), 'MMM d, yyyy') : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
                        {cat.status !== "Archived" && (
                          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleArchive(cat.id)}>
                            Archive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        category={editingCategory}
      />
    </div>
  );
}
