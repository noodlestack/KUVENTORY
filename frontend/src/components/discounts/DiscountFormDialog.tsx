import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DiscountFormData, Discount } from "@/types/discounts";
import { Switch } from "@/components/ui/switch";

const discountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["Senior Citizen", "PWD", "Delivery Driver", "Employee", "Promotional", "Manual", "Custom", "None"]),
  percentage: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100%").optional(),
  amount: z.coerce.number().min(0, "Cannot be negative").optional(),
  isActive: z.boolean(),
  description: z.string().optional(),
  requirements: z.string().optional(),
});

interface DiscountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: Discount | null;
  onSubmit: (data: DiscountFormData) => Promise<void>;
}

export function DiscountFormDialog({ open, onOpenChange, discount, onSubmit }: DiscountFormDialogProps) {
  const form = useForm<DiscountFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(discountSchema) as any,
    defaultValues: {
      name: "",
      type: "Promotional",
      percentage: 0,
      amount: 0,
      isActive: true,
      description: "",
      requirements: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (discount) {
        form.reset({
          name: discount.name,
          type: discount.type,
          percentage: discount.percentage || 0,
          amount: discount.amount || 0,
          isActive: discount.isActive,
          description: discount.description || "",
          requirements: discount.requirements || "",
        });
      } else {
        form.reset({
          name: "",
          type: "Promotional",
          percentage: 0,
          amount: 0,
          isActive: true,
          description: "",
          requirements: "",
        });
      }
    }
  }, [open, discount, form]);

  const handleSubmit = async (data: DiscountFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>{discount ? "Edit Discount" : "Add Discount"}</DialogTitle>
              <DialogDescription>
                {discount ? "Update the details of this discount rule." : "Create a new discount rule for sales transactions."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Senior Citizen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                        <SelectItem value="PWD">PWD</SelectItem>
                        <SelectItem value="Delivery Driver">Delivery Driver</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Promotional">Promotional</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Amount (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Valid ID required" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this discount
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : discount ? "Update Discount" : "Create Discount"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
