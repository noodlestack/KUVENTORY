import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PurchaseFormData } from "@/types/purchases";
import { Supplier } from "@/types/suppliers";
import { InventoryItem } from "@/types/inventory";
import { Plus, Trash2 } from "lucide-react";

const purchaseSchema = z.object({
  purchaseDate: z.string().min(1, "Date is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  items: z.array(z.object({
    itemId: z.string().min(1, "Item is required"),
    itemName: z.string(),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
    unitCost: z.coerce.number().min(0, "Cost cannot be negative"),
  })).min(1, "At least one item is required"),
  remarks: z.string().max(300, "Remarks cannot exceed 300 characters").optional(),
  status: z.enum(["Pending", "Delivered", "Cancelled"]),
});

interface PurchaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: PurchaseFormData, supplierName: string) => Promise<any>;
}

export function PurchaseFormDialog({ open, onOpenChange, suppliers, inventoryItems, onSubmit }: PurchaseFormDialogProps) {
  const form = useForm<PurchaseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      purchaseDate: new Date().toISOString().split("T")[0],
      supplierId: "",
      items: [{ itemId: "", itemName: "", quantity: 1, unitCost: 0 }],
      remarks: "",
      status: "Delivered",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        purchaseDate: new Date().toISOString().split("T")[0],
        supplierId: "",
        items: [{ itemId: "", itemName: "", quantity: 1, unitCost: 0 }],
        remarks: "",
        status: "Delivered",
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: PurchaseFormData) => {
    const supplierName = suppliers.find(s => s.id === data.supplierId)?.name || "Unknown";
    
    // Auto-fill item names just in case it got missed
    const finalData = {
      ...data,
      items: data.items.map(i => ({
        ...i,
        itemName: inventoryItems.find(inv => inv.id === i.itemId)?.name || "Unknown Item"
      }))
    };

    await onSubmit(finalData, supplierName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
          <DialogDescription>
            Log a new inbound purchase from a supplier.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Items Purchased</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: "", itemName: "", quantity: 1, unitCost: 0 })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  <div className="flex-1 w-full">
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Inventory Item</FormLabel>}
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryItems.map((i) => (
                                <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Qty</FormLabel>}
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitCost`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Unit Cost</FormLabel>}
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mb-0.5 text-destructive hover:text-destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.items.root.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes, invoice number, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Record Purchase"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
