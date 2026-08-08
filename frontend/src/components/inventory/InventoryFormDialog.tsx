import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InventoryItem, InventoryFormData } from "@/types/inventory";
import { Category } from "@/types/categories";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { Plus } from "lucide-react";

const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  itemCode: z.string().min(2, "Item Code must be at least 2 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  unit: z.string().min(1, "Unit is required"),
  supplier: z.string().min(2, "Supplier is required"),
  
  beginningStock: z.coerce.number().min(0, "Cannot be negative"),
  addedStock: z.coerce.number().min(0, "Cannot be negative"),
  morningSales: z.coerce.number().min(0, "Cannot be negative"),
  afternoonSales: z.coerce.number().min(0, "Cannot be negative"),
  
  cost: z.coerce.number().min(0, "Cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Cannot be negative"),
  expirationDate: z.string().optional(),

  minStockLevel: z.coerce.number().min(0, "Min stock cannot be negative"),
  storageLocation: z.string().min(2, "Storage location is required"),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
  status: z.enum(["In Stock", "Low Stock", "Out of Stock", "Inactive"]),
});

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  categories: Category[];
  onSubmit: (data: InventoryFormData, categoryName: string) => Promise<void>;
}

export function InventoryFormDialog({ open, onOpenChange, item, categories, onSubmit }: InventoryFormDialogProps) {
  const isEditing = !!item;
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const form = useForm<InventoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inventorySchema) as any,
    defaultValues: {
      name: "",
      itemCode: "",
      categoryId: "",
      unit: "",
      supplier: "",
      beginningStock: 0,
      addedStock: 0,
      morningSales: 0,
      afternoonSales: 0,
      cost: 0,
      sellingPrice: 0,
      expirationDate: "",
      minStockLevel: 0,
      storageLocation: "",
      notes: "",
      status: "In Stock",
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          itemCode: item.itemCode,
          categoryId: item.categoryId,
          unit: item.unit,
          supplier: item.supplier,
          beginningStock: item.beginningStock,
          addedStock: item.addedStock,
          morningSales: item.morningSales,
          afternoonSales: item.afternoonSales,
          cost: item.cost,
          sellingPrice: item.sellingPrice,
          expirationDate: item.expirationDate || "",
          minStockLevel: item.minStockLevel,
          storageLocation: item.storageLocation,
          notes: item.notes || "",
          status: item.status,
        });
      } else {
        form.reset({
          name: "",
          itemCode: "",
          categoryId: "",
          unit: "",
          supplier: "",
          beginningStock: 0,
          addedStock: 0,
          morningSales: 0,
          afternoonSales: 0,
          cost: 0,
          sellingPrice: 0,
          expirationDate: "",
          minStockLevel: 0,
          storageLocation: "",
          notes: "",
          status: "In Stock",
        });
      }
    }
  }, [open, item, form]);

  const handleSubmit = async (data: InventoryFormData) => {
    const categoryName = categories.find(c => c.id === data.categoryId)?.name || "Unknown";
    await onSubmit(data, categoryName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>{isEditing ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Modify the details of an existing inventory item." : "Register a new raw material or packaging item."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Arabica Coffee Beans" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., RAW-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.filter(c => c.status !== "Archived" || c.id === field.value).map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="shrink-0"
                        onClick={() => setIsCategoryDialogOpen(true)}
                        title="Add New Category"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., kg, L, pcs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Global Beans Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Storage Room A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="beginningStock" render={({ field }) => (
                <FormItem><FormLabel>Beginning Stock</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="addedStock" render={({ field }) => (
                <FormItem><FormLabel>Added Stock</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="morningSales" render={({ field }) => (
                <FormItem><FormLabel>Morning Sales</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="afternoonSales" render={({ field }) => (
                <FormItem><FormLabel>Afternoon Sales</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="cost" render={({ field }) => (
                <FormItem><FormLabel>Cost (₱)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                <FormItem><FormLabel>Selling Price (₱)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="expirationDate" render={({ field }) => (
                <FormItem><FormLabel>Expiration Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes & Remarks</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional remarks..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <CategoryFormDialog 
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSuccess={(newCat) => {
          // Setting a small timeout to let the parent re-render with new categories
          setTimeout(() => form.setValue("categoryId", newCat.id), 100);
        }}
      />
    </Dialog>
  );
}
