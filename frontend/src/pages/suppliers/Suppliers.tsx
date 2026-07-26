import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuppliers } from "@/hooks/suppliers/useSuppliers";
import { Supplier } from "@/types/suppliers";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import { SupplierDetailsDrawer } from "@/components/suppliers/SupplierDetailsDrawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Suppliers() {
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDrawerOpen(true);
  };

  const handleDeleteRequest = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSupplier) {
      await deleteSupplier(selectedSupplier.id);
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading suppliers...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage vendors and their contact information.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search suppliers..." className="pl-8" />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>
      
      <SupplierTable 
        suppliers={suppliers} 
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <SupplierFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        supplier={selectedSupplier}
        onSubmit={async (data) => {
          if (selectedSupplier) {
            await updateSupplier(selectedSupplier.id, data);
          } else {
            await createSupplier(data);
          }
        }}
      />

      <SupplierDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        supplier={selectedSupplier}
        onEdit={() => {
          setIsDrawerOpen(false);
          setIsFormOpen(true);
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <b>{selectedSupplier?.name}</b> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
