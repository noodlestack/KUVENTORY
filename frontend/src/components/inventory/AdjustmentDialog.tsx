import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InventoryItem, StockAdjustmentFormData } from "@/types/inventory";

const adjustmentSchema = z.object({
  itemId: z.string().min(1, "Please select an item"),
  actualQuantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().optional(),
});

interface AdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: StockAdjustmentFormData) => Promise<any>;
}

export function AdjustmentDialog({ open, onOpenChange, items, onSubmit }: AdjustmentDialogProps) {
  const form = useForm<StockAdjustmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adjustmentSchema) as any,
    defaultValues: {
      itemId: "",
      actualQuantity: 0,
      reason: "",
      remarks: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchItemId = form.watch("itemId");
  const selectedItem = items.find(i => i.id === watchItemId);
  const diff = selectedItem ? (form.watch("actualQuantity") || 0) - selectedItem.currentQuantity : 0;

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: StockAdjustmentFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Record discrepancies between physical counts and system records.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventory Item</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((i) => (
                        <SelectItem key={i.id} value={i.id}>{i.name} ({i.currentQuantity} {i.unit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && (
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md border text-sm">
                <div>
                  <p className="text-muted-foreground">Current System Quantity</p>
                  <p className="font-semibold text-lg">{selectedItem.currentQuantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Adjustment Difference</p>
                  <p className={`font-semibold text-lg ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : ""}`}>
                    {diff > 0 ? "+" : ""}{diff} {selectedItem.unit}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actualQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Physical Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Physical Count">Physical Count</SelectItem>
                        <SelectItem value="Damage/Spoilage">Damage / Spoilage</SelectItem>
                        <SelectItem value="Theft/Loss">Theft / Loss</SelectItem>
                        <SelectItem value="Data Entry Error">Data Entry Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Processing..." : "Confirm Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
